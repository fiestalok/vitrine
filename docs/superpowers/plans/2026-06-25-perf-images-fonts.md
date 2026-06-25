# Performance — Images WebP + Fonts auto-hébergées

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Passer le score PageSpeed mobile de 68 à 85+ en convertissant les images en WebP et en auto-hébergeant les fonts.

**Architecture:** Deux axes indépendants : (1) script Node.js one-shot avec `sharp` pour convertir les images JPG/PNG en WebP + mise à jour des références dans le code ; (2) remplacement des `<link>` Google Fonts par les packages npm `@fontsource` bundlés par Vite localement.

**Tech Stack:** React 19 + TypeScript + Vite 8, sharp (conversion images), @fontsource/bangers + @fontsource/nunito (fonts auto-hébergées)

---

## Fichiers modifiés

| Fichier | Modification |
|---|---|
| `scripts/convert-images.mjs` | Créé — script one-shot de conversion WebP |
| `package.json` | Ajout script `convert-images` + dépendances sharp + fontsource |
| `public/event1-6.webp` | Créés par le script |
| `public/logo.webp` | Créé par le script |
| `src/pages/EntreprisePage.tsx` | .jpg → .webp + loading="lazy" sur event2-6 |
| `src/components/seo/PageSEO.tsx` | logo.png → logo.webp |
| `src/main.tsx` | Imports @fontsource |
| `index.html` | Supprime Google Fonts, ajoute preload event1.webp |

---

### Task 1 : Installer les dépendances

**Files:**
- Modify: `package.json`

- [ ] **Step 1 : Installer sharp et fontsource**

```bash
npm install -D sharp
npm install @fontsource/bangers @fontsource/nunito
```

Résultat attendu : pas d'erreur, `node_modules/@fontsource/bangers` et `node_modules/sharp` présents.

- [ ] **Step 2 : Ajouter le script npm dans package.json**

Ouvrir `package.json`, dans la section `"scripts"`, ajouter :

```json
"convert-images": "node scripts/convert-images.mjs"
```

- [ ] **Step 3 : Vérifier**

```bash
npm run convert-images -- --help 2>&1 || echo "script not found yet - normal"
```

(Le script n'existe pas encore — c'est normal à cette étape.)

- [ ] **Step 4 : Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(perf): add sharp and fontsource dependencies"
```

---

### Task 2 : Script de conversion WebP

**Files:**
- Create: `scripts/convert-images.mjs`

- [ ] **Step 1 : Créer le dossier scripts si nécessaire**

```bash
mkdir -p scripts
```

- [ ] **Step 2 : Créer `scripts/convert-images.mjs`**

```js
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

// icon.png est le favicon — on le garde en PNG
const SKIP = new Set(['icon.png']);

const QUALITY_PNG = 90;
const QUALITY_JPG = 82;

const files = await readdir(PUBLIC_DIR);
const images = files.filter((f) => {
  if (SKIP.has(f)) return false;
  return ['.jpg', '.jpeg', '.png'].includes(extname(f).toLowerCase());
});

if (images.length === 0) {
  console.log('Aucune image à convertir.');
  process.exit(0);
}

for (const file of images) {
  const input = join(PUBLIC_DIR, file);
  const outputName = basename(file, extname(file)) + '.webp';
  const output = join(PUBLIC_DIR, outputName);

  const quality = extname(file).toLowerCase() === '.png' ? QUALITY_PNG : QUALITY_JPG;

  const before = (await stat(input)).size;
  await sharp(input).webp({ quality }).toFile(output);
  const after = (await stat(output)).size;
  const saving = Math.round((1 - after / before) * 100);

  console.log(`✓ ${file} → ${outputName}  (${Math.round(before / 1024)} Ko → ${Math.round(after / 1024)} Ko, -${saving}%)`);
}

console.log('\nConversion terminée. Vérifiez les fichiers .webp dans public/');
```

- [ ] **Step 3 : Exécuter le script**

```bash
npm run convert-images
```

Résultat attendu (approximatif) :
```
✓ event1.jpg → event1.webp  (60 Ko → 18 Ko, -70%)
✓ event2.jpg → event2.webp  (76 Ko → 22 Ko, -71%)
✓ event3.jpg → event3.webp  (80 Ko → 24 Ko, -70%)
✓ event4.jpg → event4.webp  (84 Ko → 25 Ko, -70%)
✓ event5.jpg → event5.webp  (76 Ko → 22 Ko, -71%)
✓ event6.jpg → event6.webp  (1048 Ko → ~200 Ko, -80%)
✓ logo.png  → logo.webp    (852 Ko → ~80 Ko, -90%)

Conversion terminée. Vérifiez les fichiers .webp dans public/
```

Les pourcentages exacts varient. Ce qui compte : `event6.webp` doit être **< 300 Ko** et `logo.webp` **< 100 Ko**.

- [ ] **Step 4 : Commit**

```bash
git add scripts/convert-images.mjs public/event1.webp public/event2.webp public/event3.webp public/event4.webp public/event5.webp public/event6.webp public/logo.webp
git commit -m "feat(perf): add WebP conversion script and converted images"
```

---

### Task 3 : Mettre à jour les références d'images dans le code

**Files:**
- Modify: `src/pages/EntreprisePage.tsx` (lignes 30-35 et 86)
- Modify: `src/components/seo/PageSEO.tsx` (ligne 12)

- [ ] **Step 1 : Mettre à jour EntreprisePage.tsx**

Remplacer le tableau `EVENTS` (lignes 30-35) :

```tsx
const EVENTS = [
  `${BASE}event1.webp`,
  `${BASE}event2.webp`,
  `${BASE}event3.webp`,
  `${BASE}event4.webp`,
  `${BASE}event5.webp`,
  `${BASE}event6.webp`,
];
```

Remplacer le rendu des images (chercher `EVENTS.map`) pour ajouter `loading="lazy"` sur toutes sauf la première :

```tsx
{EVENTS.map((src, i) => (
  <div key={src} className={styles.galleryItem}>
    <img src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
  </div>
))}
```

- [ ] **Step 2 : Mettre à jour PageSEO.tsx**

Chercher la ligne `DEFAULT_IMAGE` (ligne ~12) et remplacer :

```tsx
const DEFAULT_IMAGE = `${BASE_URL}/logo.webp`;
```

- [ ] **Step 3 : Vérifier qu'il ne reste aucune référence aux anciens fichiers**

```bash
grep -rn "event[0-9]\.jpg\|logo\.png" src/
```

Résultat attendu : aucune ligne (0 résultats).

- [ ] **Step 4 : Lancer les tests**

```bash
npx vitest run
```

Résultat attendu : 56 tests passent, 1 échoue (test pré-existant HomePage mailto — ignoré).

- [ ] **Step 5 : Commit**

```bash
git add src/pages/EntreprisePage.tsx src/components/seo/PageSEO.tsx
git commit -m "feat(perf): use WebP images with lazy loading"
```

---

### Task 4 : Auto-héberger les fonts + nettoyer index.html

**Files:**
- Modify: `src/main.tsx`
- Modify: `index.html`

- [ ] **Step 1 : Ajouter les imports fontsource dans src/main.tsx**

Ouvrir `src/main.tsx`. Ajouter ces imports **en haut du fichier**, avant les autres imports :

```tsx
import '@fontsource/bangers/400.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/400-italic.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
```

- [ ] **Step 2 : Supprimer Google Fonts de index.html**

Dans `index.html`, supprimer ces 4 lignes :

```html
<!-- Google Fonts: Bangers + Nunito -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 3 : Ajouter le preload pour l'image LCP dans index.html**

Dans `index.html`, dans le `<head>`, ajouter juste avant `</head>` :

```html
    <!-- Preload LCP image -->
    <link rel="preload" as="image" href="/event1.webp" />
```

- [ ] **Step 4 : Vérifier que le build passe et que les fonts sont présentes**

```bash
npm run build 2>&1 | tail -10
```

Résultat attendu : build réussi. Dans `dist/assets/`, vérifier qu'il y a des fichiers `.woff2` (fonts bundlées par Vite) :

```bash
ls dist/assets/*.woff2 2>/dev/null | head -5
```

Résultat attendu : plusieurs fichiers `.woff2` listés.

- [ ] **Step 5 : Vérifier que Google Fonts n'est plus référencé**

```bash
grep -n "fonts.googleapis\|fonts.gstatic" index.html
```

Résultat attendu : aucune ligne (0 résultats).

- [ ] **Step 6 : Lancer les tests**

```bash
npx vitest run
```

Résultat attendu : même résultat qu'avant (56 pass, 1 fail pré-existant).

- [ ] **Step 7 : Commit**

```bash
git add src/main.tsx index.html
git commit -m "feat(perf): self-host fonts via fontsource, remove Google Fonts, add LCP preload"
```
