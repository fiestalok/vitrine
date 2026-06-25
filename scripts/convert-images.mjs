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
