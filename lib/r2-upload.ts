import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = import.meta.env.VITE_R2_BUCKET;
const PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

export async function uploadToR2(file: File, folder?: string): Promise<{ publicUrl: string; key: string }> {
  const ext = file.name.split('.').pop();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = folder ? `${folder}/${Date.now()}_${safeName}` : `${Date.now()}_${safeName}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: await file.arrayBuffer(),
      ContentType: file.type || 'application/octet-stream',
    })
  );

  return { publicUrl: `${PUBLIC_URL}/${key}`, key };
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
