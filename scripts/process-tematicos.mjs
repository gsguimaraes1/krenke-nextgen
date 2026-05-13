import sharp from 'sharp';
import { mkdirSync, existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_DIR = join(__dirname, '../assets/tematicos');
const OUTPUT_DIR = join(__dirname, '../public/assets/products');

const FOLDER_TO_SLUG = {
  'AVIÃO':  'kmt-avio',
  'BARCO':  'kmt-barco',
  'TRATOR': 'kmt-trator',
  'TREM':   'kmt-trem',
};

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

function slugifyFilename(str) {
  return str
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove accents
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Recursively collect all image files from a directory
function collectFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (IMAGE_EXTS.has(extname(entry).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

const sqlLines = [];
let ok = 0, skip = 0, fail = 0;

for (const [rawFolder, productSlug] of Object.entries(FOLDER_TO_SLUG)) {
  const inputFolder = join(INPUT_DIR, rawFolder);
  if (!existsSync(inputFolder)) {
    process.stdout.write(`[AVISO] Pasta não encontrada: ${rawFolder}\n`);
    continue;
  }

  const files = collectFiles(inputFolder);
  if (files.length === 0) continue;

  const outputFolder = join(OUTPUT_DIR, productSlug);
  mkdirSync(outputFolder, { recursive: true });

  const productImages = [];
  const seenNames = new Set();

  for (const inputPath of files) {
    const baseName = inputPath.split(/[/\\]/).pop();
    let outName = slugifyFilename(baseName) + '.webp';

    // deduplicate if same normalized name appears in multiple subfolders
    let counter = 1;
    const original = outName.replace('.webp', '');
    while (seenNames.has(outName)) {
      outName = `${original}-${counter++}.webp`;
    }
    seenNames.add(outName);

    const outPath = join(outputFolder, outName);
    const webPath = `/assets/products/${productSlug}/${outName}`;
    productImages.push(webPath);

    if (existsSync(outPath)) {
      process.stdout.write(`[SKIP] ${productSlug}/${outName}\n`);
      skip++;
      continue;
    }

    try {
      await sharp(inputPath)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outPath);
      process.stdout.write(`[OK]   ${productSlug}/${outName}\n`);
      ok++;
    } catch (e) {
      process.stdout.write(`[ERRO] ${productSlug}/${outName}: ${e.message}\n`);
      fail++;
    }
  }

  if (productImages.length > 0) {
    const mainImage = productImages[0];
    const imagesArray = `ARRAY[${productImages.map(u => `'${u}'`).join(',')}]::text[]`;
    sqlLines.push(
      `UPDATE products SET image='${mainImage}', images=${imagesArray} WHERE slug='${productSlug}';`
    );
  }
}

const sqlPath = join(__dirname, '../migration_update_tematicos.sql');
writeFileSync(sqlPath, sqlLines.join('\n') + '\n');

console.log(`\n=== CONCLUÍDO: ${ok} processadas, ${skip} já existiam, ${fail} erros ===`);
console.log(`SQL gerado em: migration_update_tematicos.sql (${sqlLines.length} produtos)`);
