export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const LOGO_URL =
    'https://s3.krenke.com.br/krenke_marca_preferencial%20(1).jpg';

  try {
    const upstream = await fetch(LOGO_URL);
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const buf = await upstream.arrayBuffer();
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(Buffer.from(buf));
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
