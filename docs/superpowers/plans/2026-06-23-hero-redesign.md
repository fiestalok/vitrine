# Hero Section Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the hero section into a full-viewport gradient hero with pop-bounce text animations, the castle as background element, and two focused CTAs ("Demander un devis" + "Voir le catalogue").

**Architecture:** Two files change — `src/pages/HomePage.module.css` (hero block rewritten, new animations/trust band/scroll indicator added, responsive updated) and `src/pages/HomePage.tsx` (hero JSX restructured, scroll indicator `useEffect` added, trust band extracted below hero). No shared components are modified.

**Tech Stack:** React 19, TypeScript, CSS Modules, Vite, Vitest + RTL

---

### Task 1: CSS — Réécrire le bloc hero

**Files:**
- Modify: `src/pages/HomePage.module.css`

- [ ] **Step 1 : Remplacer les règles hero existantes (lignes 1–27)**

Dans `src/pages/HomePage.module.css`, remplacer le bloc entier depuis `.hero {` jusqu'à `.trust li span { color: …; }` (inclus) par :

```css
/* ===== HERO ===== */
.hero {
  min-height: 100vh;
  padding-top: var(--navbar-height);
  background: linear-gradient(135deg, #FF6B6B 0%, #ff8e53 55%, #FFE66D 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heroInner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  gap: var(--space-lg);
  padding: var(--space-xl) var(--space-md);
  width: 100%;
  max-width: 700px;
}

.castleBg {
  position: absolute;
  bottom: -20px;
  right: -40px;
  opacity: 0.12;
  z-index: 0;
  pointer-events: none;
}

.heroBadge {
  background: #fff !important;
  color: var(--color-danger) !important;
}

.title {
  font-size: clamp(3rem, 6vw + 1rem, 5.5rem);
  margin: 0;
  color: #fff;
  text-shadow: 2px 4px 0 rgba(45, 52, 54, 0.2);
}

.titleAccent {
  color: #FFE66D;
  display: inline-block;
  transform: rotate(-2deg);
}

.lead {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.ctas {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  justify-content: center;
}

.ctaDevis {
  background: #fff !important;
  color: var(--color-danger) !important;
  border-color: transparent !important;
  box-shadow: 3px 3px 0 rgba(45, 52, 54, 0.25) !important;
}

/* === Animations d'entrée pop-rebond === */
@keyframes pop-in {
  from { opacity: 0; transform: scale(0.72); }
  to   { opacity: 1; transform: scale(1); }
}

.animBadge { animation: pop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.10s both; }
.animTitle { animation: pop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.30s both; }
.animLead  { animation: pop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.50s both; }
.animCtas  { animation: pop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.70s both; }

@media (prefers-reduced-motion: reduce) {
  .animBadge, .animTitle, .animLead, .animCtas { animation: none; }
}

/* === Scroll indicator === */
.scrollIndicator {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.6rem;
  line-height: 1;
  pointer-events: none;
  z-index: 1;
  animation: bounce-arrow 1.8s ease-in-out infinite;
  transition: opacity 0.5s;
}
.scrollIndicatorHidden { opacity: 0; }

@keyframes bounce-arrow {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.8; }
  50%       { transform: translateX(-50%) translateY(8px); opacity: 0.3; }
}

/* === Trust band (sous la hero) === */
.trustBand {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-xl);
  padding: var(--space-lg) var(--space-xl);
  background: var(--color-bg-alt);
  border-top: 1.5px solid var(--color-border);
  border-bottom: 1.5px solid var(--color-border);
}
.trustItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}
.trustItem strong {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--color-danger);
  letter-spacing: 0.04em;
}
.trustItem span {
  color: var(--color-ink-soft);
  font-size: 0.85rem;
}
```

- [ ] **Step 2 : Mettre à jour le breakpoint 1100px**

Remplacer :
```css
@media (max-width: 1100px) {
  .castleHero, .castleWarm, .castleCool, .castleDark { display: none; }
}
```
Par :
```css
@media (max-width: 1100px) {
  .castleWarm, .castleCool, .castleDark { display: none; }
  .castleBg { width: 260px !important; }
}
```

- [ ] **Step 3 : Mettre à jour le breakpoint 900px**

Remplacer :
```css
@media (max-width: 900px) {
  .heroInner {
    grid-template-columns: 1fr;
    grid-template-areas: "text" "ctas" "trust";
  }
  .steps, .categories, .values, .productGrid { grid-template-columns: 1fr 1fr; }
}
```
Par :
```css
@media (max-width: 900px) {
  .steps, .categories, .values, .productGrid { grid-template-columns: 1fr 1fr; }
}
```

- [ ] **Step 4 : Mettre à jour le breakpoint 560px — bloc hero**

Dans le `@media (max-width: 560px)`, remplacer le commentaire et les règles hero/trust (tout ce qui concerne la hero, de `/* Hero — bloc central… */` jusqu'à `.ctas > * { width: 100%; }` inclus) par :

```css
  /* Hero */
  .hero { padding-top: calc(var(--navbar-height) + var(--space-md)); }
  .title { font-size: clamp(2.8rem, 13vw, 4rem); }
  .lead  { font-size: 1.05rem; }
  .title br, .lead br { display: none; }
  .titleAccent::before { content: " "; }
  .ctas { flex-direction: column; align-items: stretch; width: 100%; max-width: 320px; }
  .ctas > * { width: 100%; }
  .castleBg { width: 180px !important; right: -20px; }
  .trustBand { gap: var(--space-lg); padding: var(--space-md) var(--space-lg); }
```

Supprimer également la ligne `.trust { grid-template-columns: 1fr 1fr; padding: var(--space-md); }` du breakpoint 560px (elle référence l'ancienne classe `.trust`).

- [ ] **Step 5 : Vérifier lint**

```
npm run lint
```
Résultat attendu : aucune erreur.

---

### Task 2: TSX — Restructurer le JSX de la hero

**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1 : Ajouter useRef et useEffect**

Dans `src/pages/HomePage.tsx`, mettre à jour la première ligne en ajoutant `useRef` et `useEffect` :

```tsx
import { useRef, useEffect } from 'react';
```

Cette ligne s'ajoute après `import { Link } from 'react-router-dom';`.

- [ ] **Step 2 : Ajouter la logique du scroll indicator dans `HomePage`**

Après `const cartDatedItem = cartItems.find(…)`, ajouter :

```tsx
const scrollIndicatorRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const el = scrollIndicatorRef.current;
  if (!el) return;
  const onScroll = () => {
    if (window.scrollY > 40) el.classList.add(styles.scrollIndicatorHidden);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

- [ ] **Step 3 : Remplacer la section hero entière**

Remplacer le bloc `<section className={styles.hero}>…</section>` existant par :

```tsx
<section className={styles.hero}>
  <Bubbles variant="hero" />
  <div className={styles.castleBg}>
    <Castle size={380} rotation={-6} noInflate />
  </div>
  <div className={`container ${styles.heroInner}`}>
    <Badge
      tone="danger"
      rotation={-3}
      className={`${styles.heroBadge} ${styles.animBadge}`}
    >
      LES KINGS DU GONFLABLE 👑
    </Badge>
    <h1 className={`${styles.title} ${styles.animTitle}`}>
      Ta fête va<br/>
      <span className={styles.titleAccent}>décoller.</span>
    </h1>
    <p className={`${styles.lead} ${styles.animLead}`}>
      Châteaux gonflables, photobooths, sono et bien plus —<br/>
      on s'occupe de tout, vous kiffez.
    </p>
    <div className={`${styles.ctas} ${styles.animCtas}`}>
      <Button to="/devis" variant="secondary" size="lg" className={styles.ctaDevis}>
        Demander un devis →
      </Button>
      <Button to="/catalogue" variant="secondary" size="lg">
        Voir le catalogue
      </Button>
    </div>
  </div>
  <div
    ref={scrollIndicatorRef}
    className={styles.scrollIndicator}
    aria-hidden="true"
  >
    ↓
  </div>
</section>
```

- [ ] **Step 4 : Ajouter la trust band sous la hero**

Juste après le `</section>` de la hero (avant le `<Section id="how-it-works" …>`), ajouter :

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

- [ ] **Step 5 : Vérifier lint**

```
npm run lint
```
Résultat attendu : aucune erreur.

- [ ] **Step 6 : Vérifier les tests existants**

```
npx vitest run
```
Résultat attendu : tous les tests passent.

- [ ] **Step 7 : Commit**

```bash
git add src/pages/HomePage.tsx src/pages/HomePage.module.css
git commit -m "feat(hero): full-viewport gradient hero, pop-bounce animations, devis CTA"
```

---

### Task 3: Test de fumée

**Files:**
- Create: `src/tests/HomePage.test.tsx`

- [ ] **Step 1 : Écrire le test**

Créer `src/tests/HomePage.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { HomePage } from '../pages/HomePage';

vi.mock('../context/ProductsContext', () => ({
  useProducts: () => ({ products: [], loading: false }),
}));
vi.mock('../context/CategoriesContext', () => ({
  useCategories: () => ({ categories: [], loading: false }),
}));
vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    items: [],
    totalItems: 0,
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    removeItems: vi.fn(),
    setQuantity: vi.fn(),
    updateDates: vi.fn(),
    clear: vi.fn(),
  }),
}));

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

test('hero contient le CTA "Demander un devis" vers /devis', () => {
  renderHomePage();
  const link = screen.getByRole('link', { name: /demander un devis/i });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute('href', '/devis');
});

test('hero contient le CTA "Voir le catalogue"', () => {
  renderHomePage();
  expect(screen.getByRole('link', { name: /voir le catalogue/i })).toBeInTheDocument();
});

test('la trust band affiche les éléments de confiance', () => {
  renderHomePage();
  expect(screen.getByText(/équipe certifiée/i)).toBeInTheDocument();
  expect(screen.getByText(/alsacien/i)).toBeInTheDocument();
});
```

- [ ] **Step 2 : Lancer le nouveau test**

```
npx vitest run src/tests/HomePage.test.tsx
```
Résultat attendu : 3 tests PASS.

- [ ] **Step 3 : Lancer la suite complète**

```
npx vitest run
```
Résultat attendu : tous les tests passent.

- [ ] **Step 4 : Commit**

```bash
git add src/tests/HomePage.test.tsx
git commit -m "test(hero): smoke test CTAs et trust band"
```
