import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { setCors, getCallerRole } from './_utils.js';

export const config = { api: { bodyParser: false } };

const MAX_PUBLIC_CV = 5 * 1024 * 1024;   // 5MB — public job-application CVs
const MAX_AUTHED = 25 * 1024 * 1024;     // 25MB — staff uploads

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Optional auth: staff (super/reseller) may upload anything; unauthenticated
    // callers are limited to job-application CVs (see below).
    const role = await getCallerRole(req);
    const isStaff = role === 'super' || role === 'reseller';

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

    // Access control + size/type limits.
    if (!isStaff) {
      const isCv = folder === 'curriculos';
      const isPdf = (file.mimetype || '') === 'application/pdf';
      if (!isCv || !isPdf) return res.status(401).json({ error: 'Unauthorized' });
      if ((file.size || 0) > MAX_PUBLIC_CV) return res.status(413).json({ error: 'Arquivo excede 5MB.' });
    } else if ((file.size || 0) > MAX_AUTHED) {
      return res.status(413).json({ error: 'Arquivo muito grande (máx. 25MB).' });
    }

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
