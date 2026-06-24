import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { IncomingForm } = await import('formidable');
    const form = new IncomingForm();

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const folder = Array.isArray(fields.folder) ? fields.folder[0] : (fields.folder || '');
    const bucketParam = Array.isArray(fields.bucket) ? fields.bucket[0] : (fields.bucket || '');

    if (!file) return res.status(400).json({ error: 'No file provided' });

    const { readFileSync } = await import('fs');

    const isJobsBucket = bucketParam === 'vagas-krenke';
    const bucket = isJobsBucket
      ? (process.env.VITE_R2_JOBS_BUCKET || 'vagas-krenke')
      : (process.env.VITE_R2_BUCKET || 'revendedor');
    const publicUrlBase = isJobsBucket
      ? process.env.VITE_R2_JOBS_PUBLIC_URL
      : process.env.VITE_R2_PUBLIC_URL;

    const r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.VITE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.VITE_R2_SECRET_ACCESS_KEY,
      },
    });

    const safeName = file.originalFilename.replace(/[^a-zA-Z0-9._\- ]/g, '_');
    const uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
    const key = `${uid}_${safeName}`;
    const body = readFileSync(file.filepath);

    await r2.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.mimetype || 'application/octet-stream',
    }));

    const publicUrl = publicUrlBase
      ? `${publicUrlBase}/${key}`
      : `https://${process.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucket}/${key}`;

    return res.status(200).json({ publicUrl, key });
  } catch (err) {
    console.error('R2 upload error:', err);
    return res.status(500).json({ error: err.message });
  }
}
