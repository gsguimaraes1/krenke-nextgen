import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || '';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    const accountId = process.env.VITE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.VITE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.VITE_R2_SECRET_ACCESS_KEY;
    const bucket = process.env.VITE_R2_BUCKET;
    const publicUrl = process.env.VITE_R2_PUBLIC_URL;

    const r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = folder ? `${folder}/${Date.now()}_${safeName}` : `${Date.now()}_${safeName}`;
    const arrayBuffer = await file.arrayBuffer();

    await r2.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type || 'application/octet-stream',
    }));

    return new Response(
      JSON.stringify({ publicUrl: `${publicUrl}/${key}`, key }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    console.error('R2 upload error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

export const config = { path: '/api/upload-to-r2' };
