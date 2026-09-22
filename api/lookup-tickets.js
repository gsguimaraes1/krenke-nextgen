import { setCors, supabaseAdmin, verifyTurnstile, callerIp, normalizePhone } from './_utils.js';

// Consulta pública de chamados do próprio cliente (/meus-chamados). Exige e-mail
// E telefone batendo (não só um dos dois) pra reduzir enumeração — só service
// role lê sac_tickets direto, RLS não libera nada pro público.

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { captchaToken, email, phone } = req.body || {};

    if (!(await verifyTurnstile(captchaToken, callerIp(req)))) {
      return res.status(403).json({ error: 'Falha na verificação anti-bot. Recarregue a página e tente novamente.' });
    }

    const cleanEmail = (typeof email === 'string' ? email : '').trim().toLowerCase();
    const cleanPhone = normalizePhone(typeof phone === 'string' ? phone : '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || !cleanPhone) {
      return res.status(400).json({ error: 'Informe e-mail e telefone válidos.' });
    }

    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from('sac_tickets')
      .select('ticket_number, title, category, status, priority, created_at, resolved_at, client_phone')
      .eq('client_email', cleanEmail)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('lookup-tickets error:', error);
      return res.status(500).json({ error: 'Erro ao buscar chamados.' });
    }

    const tickets = (data || [])
      .filter((t) => normalizePhone(t.client_phone) === cleanPhone)
      .slice(0, 20)
      .map(({ client_phone, ...rest }) => rest);

    return res.status(200).json({ tickets });
  } catch (err) {
    console.error('lookup-tickets error:', err);
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
}
