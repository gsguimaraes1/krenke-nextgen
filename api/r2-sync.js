import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const makeR2 = () =>
  new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.VITE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.VITE_R2_SECRET_ACCESS_KEY,
    },
  });

const sbFetch = (path, opts = {}) => {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/${path}`;
  return fetch(url, {
    ...opts,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      ...(opts.headers || {}),
    },
  });
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const bucket = process.env.VITE_R2_BUCKET || 'revendedor';
    const publicUrlBase = (process.env.VITE_R2_PUBLIC_URL || 'https://s3.krenke.com.br').replace(/\/$/, '');

    // List all objects in R2
    const objects = [];
    let continuationToken;
    const r2 = makeR2();
    do {
      const result = await r2.send(new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }));
      for (const obj of result.Contents || []) objects.push(obj);
      continuationToken = result.NextContinuationToken;
    } while (continuationToken);

    // Get existing tracked files from Supabase
    const existingRes = await sbFetch('reseller_files?select=storage_path,file_url');
    const existing = await existingRes.json();
    const existingKeys = new Set(
      (existing || []).flatMap(f => {
        const keys = [];
        if (f.storage_path) keys.push(f.storage_path, decodeURIComponent(f.storage_path));
        if (f.file_url) {
          try { keys.push(decodeURIComponent(new URL(f.file_url).pathname.slice(1))); } catch {}
        }
        return keys;
      })
    );

    const toInsert = [];
    for (const obj of objects) {
      const key = obj.Key;
      if (!key) continue;
      if (existingKeys.has(key) || existingKeys.has(decodeURIComponent(key))) continue;

      const fileName = decodeURIComponent(key.split('/').pop() || key);
      const ext = fileName.split('.').pop()?.toLowerCase() || '';

      toInsert.push({
        name: fileName,
        file_url: `${publicUrlBase}/${key}`,
        file_type: ext,
        folder_id: null,
        size: obj.Size || 0,
        storage_path: key,
      });
    }

    if (toInsert.length > 0) {
      const insertRes = await sbFetch('reseller_files', {
        method: 'POST',
        body: JSON.stringify(toInsert),
      });
      if (!insertRes.ok) {
        const err = await insertRes.text();
        return res.status(500).json({ error: err });
      }
    }

    return res.status(200).json({
      found: objects.length,
      synced: toInsert.length,
      files: toInsert.map(f => f.name),
    });
  } catch (err) {
    console.error('r2-sync error:', err);
    return res.status(500).json({ error: err.message });
  }
}
