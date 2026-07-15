import { createClient } from '@supabase/supabase-js';
import { setCors } from './_utils.js';

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL || 'https://rkimlgpwshntyzaoqxpb.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const callerToken = authHeader.slice(7);
  const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(callerToken);
  if (callerError || !callerUser) return res.status(401).json({ error: 'Invalid token' });

  const { data: callerProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', callerUser.id).single();
  if (callerProfile?.role !== 'super') return res.status(403).json({ error: 'Forbidden: super admin only' });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  if (userId === callerUser.id) return res.status(400).json({ error: 'Não é possível excluir sua própria conta.' });

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ success: true });
}
