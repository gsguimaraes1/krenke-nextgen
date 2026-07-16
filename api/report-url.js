import { createClient } from '@supabase/supabase-js';
import { setCors } from './_utils.js';

// Hardcoded allowlist — deliberately separate from the `profiles.role` column.
// Only these specific accounts may resolve report URLs, regardless of role.
const ALLOWED_USER_IDS = new Set([
  'be2d8c0a-6b59-4158-ba51-7a2e8b5dfc17',
  'd19952b5-151c-4943-bf74-1a07b199ba75',
  '1757670c-5ab0-4642-82b3-9acdbfa14701',
]);

const REPORTS = {
  vendas: 'https://app.powerbi.com/view?r=eyJrIjoiMDliZWRjNTAtNzdlNS00OWJlLTlmZGUtY2NlZTMyOTJjNzgyIiwidCI6ImU1ZjY5ZGFiLTdkYWYtNGU1MS04MjdhLTEwNjkxOWE4ZjU5MCJ9',
};

export default async function handler(req, res) {
  setCors(req, res, 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  if (!ALLOWED_USER_IDS.has(user.id)) return res.status(403).json({ error: 'Forbidden' });

  const key = typeof req.query.report === 'string' ? req.query.report : 'vendas';
  const url = REPORTS[key];
  if (!url) return res.status(404).json({ error: 'Report not found' });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ url });
}
