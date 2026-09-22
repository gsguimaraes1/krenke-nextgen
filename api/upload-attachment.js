import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { setCors, getCallerRole } from './_utils.js';

// Upload de anexo (fotos de instalação/defeito) pro R2 — mesmo bucket/credenciais
// do site principal (api/upload-to-r2.js), prefixo 'sac-anexos/' pra isolar.
// Público só manda foto (form /abrir-chamado, antes do chamado existir);
// staff autenticado (sac/super) manda de qualquer tipo, no modal do Kanban.

export const config = { api: { bodyParser: false } };

const MAX_PUBLIC = 8 * 1024 * 1024;
const MAX_STAFF = 20 * 1024 * 1024;
const PUBLIC_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const role = await getCallerRole(req);
    const isStaff = role === 'sac' || role === 'super';

    const { IncomingForm } = await import('formidable');
    const form = new IncomingForm();
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, _fields, files) => (err ? reject(err) : resolve({ files })));
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    if (!isStaff) {
      if (!PUBLIC_MIME.includes(file.mimetype || '')) {
        return res.status(415).json({ error: 'Envie apenas fotos (JPEG, PNG ou WEBP).' });
      }
      if ((file.size || 0) > MAX_PUBLIC) return res.status(413).json({ error: 'Arquivo excede 8MB.' });
    } else if ((file.size || 0) > MAX_STAFF) {
      return res.status(413).json({ error: 'Arquivo muito grande (máx. 20MB).' });
    }

    if (!process.env.VITE_R2_BUCKET || !process.env.VITE_R2_ACCOUNT_ID) {
      return res.status(500).json({ error: 'Upload não configurado (R2).' });
    }

    const { readFileSync } = await import('fs');
    const r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.VITE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.VITE_R2_SECRET_ACCESS_KEY,
      },
    });

    const safeName = (file.originalFilename || 'arquivo').replace(/[^a-zA-Z0-9._\- ]/g, '_');
    const uid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
    const key = `sac-anexos/${uid}_${safeName}`;
    const body = readFileSync(file.filepath);

    await r2.send(new PutObjectCommand({
      Bucket: process.env.VITE_R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: file.mimetype || 'application/octet-stream',
    }));

    if (!process.env.VITE_R2_PUBLIC_URL) {
      return res.status(500).json({ error: 'Upload não configurado (URL pública R2).' });
    }

    return res.status(200).json({
      file_url: `${process.env.VITE_R2_PUBLIC_URL}/${key}`,
      file_name: file.originalFilename || safeName,
      file_size: file.size || 0,
      content_type: file.mimetype || 'application/octet-stream',
    });
  } catch (err) {
    console.error('upload-attachment error:', err);
    return res.status(500).json({ error: 'Erro ao enviar arquivo.' });
  }
}
