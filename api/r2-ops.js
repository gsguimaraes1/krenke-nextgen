import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { setCors, requireRole } from './_utils.js';

const r2 = () =>
  new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.VITE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.VITE_R2_SECRET_ACCESS_KEY,
    },
  });

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Destructive: only super admins may delete objects.
  if (!(await requireRole(req, res, ['super']))) return;

  const { action, key, bucket: bucketParam } = req.body;
  const bucket = bucketParam || process.env.VITE_R2_BUCKET || 'revendedor';

  if (action === 'delete') {
    if (!key) return res.status(400).json({ error: 'key required' });
    await r2().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'unknown action' });
}
