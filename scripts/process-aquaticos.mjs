import sharp from 'sharp';
import { mkdirSync, existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_DIR = join(__dirname, '../assets/aquatico');
const OUTPUT_DIR = join(__dirname, '../public/assets/products');

// products not yet in DB — process images but skip SQL
const NO_DB_ENTRY = new Set(['kaq-0101', 'kaq-0202', 'kaq-0302']);

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

function folderToSlug(name) {
  // "KAQ 0201" → "kaq-0201"
  return name.toLowerCase().replace(/\s+/g, '-');
}

function slugifyFilename(str) {
  return str
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const sqlLines = [];
let ok = 0, skip = 0, fail = 0;

const folders = readdirSync(INPUT_DIR).filter(f =>
  statSync(join(INPUT_DIR, f)).isDirectory()
);

for (const rawFolder of folders) {
  const productSlug = folderToSlug(rawFolder);
  const inputFolder = join(INPUT_DIR, rawFolder);
  const outputFolder = join(OUTPUT_DIR, productSlug);

  const files = readdirSync(inputFolder).filter(f => {
    const full = join(inputFolder, f);
    return statSync(full).isFile() && IMAGE_EXTS.has(extname(f).toLowerCase());
  });

  if (files.length === 0) continue;

  mkdirSync(outputFolder, { recursive: true });

  const productImages = [];

  for (const file of files) {
    const inputPath = join(inputFolder, file);
    const outName = slugifyFilename(file) + '.webp';
    const outPath = join(outputFolder, outName);
    const webPath = `/assets/products/${productSlug}/${outName}`;

    productImages.push(webPath);

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

  if (productImages.length > 0 && !NO_DB_ENTRY.has(productSlug)) {
    const mainImage = productImages[0];
    const imagesArray = `ARRAY[${productImages.map(u => `'${u}'`).join(',')}]::text[]`;
    sqlLines.push(
      `UPDATE products SET image='${mainImage}', images=${imagesArray} WHERE slug='${productSlug}';`
    );
  }
}

const sqlPath = join(__dirname, '../migration_update_aquaticos.sql');
writeFileSync(sqlPath, sqlLines.join('\n') + '\n');

console.log(`\n=== CONCLUÍDO: ${ok} processadas, ${skip} já existiam, ${fail} erros ===`);
console.log(`SQL gerado em: migration_update_aquaticos.sql (${sqlLines.length} produtos)`);
