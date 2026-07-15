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

  // Verify caller is super admin
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const callerToken = authHeader.slice(7);
  const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(callerToken);
  if (callerError || !callerUser) return res.status(401).json({ error: 'Invalid token' });

  const { data: callerProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', callerUser.id).single();
  if (callerProfile?.role !== 'super') return res.status(403).json({ error: 'Forbidden: super admin only' });

  const { full_name, email, phone, role } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });

  const allowedRoles = ['super', 'restricted', 'reseller', 'hr', 'mkt'];
  if (role && !allowedRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: full_name || '' },
  });

  if (error) {
    const msg = error.message || '';
    if (msg.includes('Database error saving new user') || msg.includes('already registered') || msg.includes('already been registered')) {
      return res.status(400).json({ error: 'E-mail já cadastrado. Use o botão "Enviar Convite" na linha do usuário para reenviar.' });
    }
    return res.status(400).json({ error: msg });
  }

  if (data?.user) {
    await supabaseAdmin.from('profiles').update({
      full_name: full_name || '',
      phone: phone || null,
      role: role || 'restricted',
    }).eq('id', data.user.id);
  }

  return res.status(200).json({ success: true, user: { id: data.user?.id, email: data.user?.email } });
}
