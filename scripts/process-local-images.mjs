import sharp from 'sharp';
import { mkdirSync, existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_DIR = join(__dirname, '../assets/playgrounds_padroes');
const OUTPUT_DIR = join(__dirname, '../public/assets/products');

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\.[^.]+$/, '')         // remove extension
    .replace(/\s*-\s*/g, '-')        // normalize " - " to "-"
    .replace(/\s+/g, '-')            // spaces to hyphens
    .replace(/[^a-z0-9\-]/g, '')     // remove non-alphanumeric
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '');          // trim leading/trailing hyphens
}

const sqlLines = [];
let ok = 0, skip = 0, fail = 0;

const productFolders = readdirSync(INPUT_DIR).filter(f => {
  const full = join(INPUT_DIR, f);
  return statSync(full).isDirectory() && /^kmp[_-]/i.test(f);
});

for (const rawFolder of productFolders) {
  const productSlug = rawFolder.replace(/_/g, '-').toLowerCase();
  const inputFolder = join(INPUT_DIR, rawFolder);
  const outputFolder = join(OUTPUT_DIR, productSlug);

  const files = readdirSync(inputFolder).filter(f => {
    const full = join(inputFolder, f);
    // only process files, not subfolders
    if (!statSync(full).isFile()) return false;
    const ext = extname(f).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
  });

  if (files.length === 0) continue;

  mkdirSync(outputFolder, { recursive: true });

  const productImages = [];

  for (const file of files) {
    const inputPath = join(inputFolder, file);
    const outName = slugify(file) + '.webp';
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

const sqlPath = join(__dirname, '../migration_update_product_images.sql');
writeFileSync(sqlPath, sqlLines.join('\n') + '\n');

console.log(`\n=== CONCLUÍDO: ${ok} processadas, ${skip} já existiam, ${fail} erros ===`);
console.log(`SQL gerado em: migration_update_product_images.sql (${sqlLines.length} produtos)`);
