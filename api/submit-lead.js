import { setCors, supabaseAdmin, verifyTurnstile, callerIp } from './_utils.js';

// Public quote-form submission. Replaces the direct anon insert into `leads`:
// verifies Turnstile, inserts with the service role and fires the n8n webhook
// server-side so webhook URLs never reach the browser.
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { captchaToken, lead } = req.body || {};
    if (!lead || typeof lead !== 'object') {
      return res.status(400).json({ error: 'Dados inválidos.' });
    }

    if (!(await verifyTurnstile(captchaToken, callerIp(req)))) {
      return res.status(403).json({ error: 'Falha na verificação anti-bot. Recarregue a página e tente novamente.' });
    }

    const str = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    const data = {
      name: str(lead.name, 200),
      phone: str(lead.phone, 30),
      email: str(lead.email, 200).toLowerCase(),
      client_type: str(lead.client_type, 50),
      segment: str(lead.segment, 100),
      message: str(lead.message, 5000),
      city: str(lead.city, 120),
      state: str(lead.state, 2),
      products: Array.isArray(lead.products) ? lead.products.slice(0, 100).map((p) => str(p, 200)) : [],
      source: 'Site Krenke - Orçamento',
      submitted_at: new Date().toISOString(),
      utm_source: str(lead.utm_source, 200) || null,
      utm_medium: str(lead.utm_medium, 200) || null,
      utm_campaign: str(lead.utm_campaign, 200) || null,
      utm_term: str(lead.utm_term, 200) || null,
      utm_content: str(lead.utm_content, 200) || null,
      utm_id: str(lead.utm_id, 200) || null,
    };

    if (data.name.length < 3) return res.status(400).json({ error: 'Nome inválido.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return res.status(400).json({ error: 'E-mail inválido.' });
    if (!data.phone) return res.status(400).json({ error: 'Telefone inválido.' });
    if (data.products.length === 0) return res.status(400).json({ error: 'Selecione ao menos um produto.' });

    const admin = supabaseAdmin();
    const { error } = await admin.from('leads').insert([data]);
    if (error) {
      console.error('Lead insert error:', error);
      return res.status(500).json({ error: 'Erro ao salvar o orçamento. Tente novamente.' });
    }

    // Webhook dispatch (server-side). Failure here must not fail the submission.
    try {
      const { data: settings } = await admin
        .from('site_settings')
        .select('key, value')
        .in('key', ['webhook_mode', 'webhook_prod_url', 'webhook_test_url']);
      const get = (k) => settings?.find((s) => s.key === k)?.value;
      const webhookUrl = (get('webhook_mode') || 'test') === 'prod' ? get('webhook_prod_url') : get('webhook_test_url');
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            form_type: 'orcamento',
            ...data,
            products: data.products.join(', '),
            city_full: data.city ? `${data.city} - ${data.state}` : '',
          }),
        });
      }
    } catch (err) {
      console.error('Lead webhook error:', err);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit-lead error:', err);
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
}
