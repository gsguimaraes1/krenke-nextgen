import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const accountId = env.VITE_R2_ACCOUNT_ID;
const accessKeyId = env.VITE_R2_ACCESS_KEY_ID;
const secretAccessKey = env.VITE_R2_SECRET_ACCESS_KEY;
const bucket = env.VITE_R2_BUCKET;
const publicUrl = env.VITE_R2_PUBLIC_URL;

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

const NEW_KEY = 'catalogo/catalogo-krenke-2026.pdf';
const filePath = path.resolve(__dirname, '../CataloVfinal2026altaqualidadedigital.pdf');

async function deleteOldCatalogs() {
  const { Contents } = await r2.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: 'catalogo/' }));
  if (!Contents || Contents.length === 0) {
    console.log('Nenhum catálogo antigo encontrado no R2.');
    return;
  }
  for (const obj of Contents) {
    if (obj.Key !== NEW_KEY) {
      await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: obj.Key }));
      console.log(`Deletado do R2: ${obj.Key}`);
    }
  }
}

async function upload() {
  if (!fs.existsSync(filePath)) {
    console.error('Arquivo não encontrado:', filePath);
    process.exit(1);
  }

  const stat = fs.statSync(filePath);
  const sizeMB = (stat.size / 1024 / 1024).toFixed(1);
  console.log(`Fazendo upload de ${sizeMB}MB para R2...`);
  console.log(`Bucket: ${bucket}, Key: ${NEW_KEY}`);

  const body = fs.readFileSync(filePath);

  await r2.send(new PutObjectCommand({
    Bucket: bucket,
    Key: NEW_KEY,
    Body: body,
    ContentType: 'application/pdf',
    CacheControl: 'public, max-age=31536000',
  }));

  const url = `${publicUrl}/${NEW_KEY}`;
  console.log('\nUpload concluído!');
  console.log('URL pública:', url);

  await deleteOldCatalogs();
  console.log('\nURL final para o Catalogo.tsx:');
  console.log(url);
}

upload().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
