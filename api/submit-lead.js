import { setCors, supabaseAdmin, verifyTurnstile, callerIp } from './_utils.js';

// Public lead submission (quote form, catalog gate and WhatsApp widget).
// Replaces the direct anon inserts into `leads`: verifies Turnstile, inserts
// with the service role and fires the n8n webhook server-side so webhook URLs
// never reach the browser.

const FORM_TYPES = {
  orcamento: { source: 'Site Krenke - Orçamento', requireProducts: true },
  catalogo: { source: 'Acesso Catálogo 2026', requireProducts: false },
  whatsapp: { source: 'WhatsApp Widget', requireProducts: false },
};

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { captchaToken, lead, form_type: formTypeRaw } = req.body || {};
    const formType = FORM_TYPES[formTypeRaw] ? formTypeRaw : 'orcamento';
    const { source, requireProducts } = FORM_TYPES[formType];

    if (!lead || typeof lead !== 'object') {
      return res.status(400).json({ error: 'Dados inválidos.' });
    }

    if (!(await verifyTurnstile(captchaToken, callerIp(req)))) {
      return res.status(403).json({ error: 'Falha na verificação anti-bot. Recarregue a página e tente novamente.' });
    }

    const str = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    const opt = (v, max) => str(v, max) || null;
    const data = {
      name: str(lead.name, 200),
      phone: str(lead.phone, 30),
      email: str(lead.email, 200).toLowerCase(),
      client_type: opt(lead.client_type, 50),
      segment: opt(lead.segment, 100),
      message: opt(lead.message, 5000),
      city: opt(lead.city, 120),
      state: opt(lead.state, 2),
      products: Array.isArray(lead.products) ? lead.products.slice(0, 100).map((p) => str(p, 200)) : null,
      source,
      submitted_at: new Date().toISOString(),
      utm_source: opt(lead.utm_source, 200),
      utm_medium: opt(lead.utm_medium, 200),
      utm_campaign: opt(lead.utm_campaign, 200),
      utm_term: opt(lead.utm_term, 200),
      utm_content: opt(lead.utm_content, 200),
      utm_id: opt(lead.utm_id, 200),
    };

    if (data.name.length < 3) return res.status(400).json({ error: 'Nome inválido.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return res.status(400).json({ error: 'E-mail inválido.' });
    if (!data.phone) return res.status(400).json({ error: 'Telefone inválido.' });
    if (requireProducts && (!data.products || data.products.length === 0)) {
      return res.status(400).json({ error: 'Selecione ao menos um produto.' });
    }

    const admin = supabaseAdmin();
    const { error } = await admin.from('leads').insert([data]);
    if (error) {
      console.error('Lead insert error:', error);
      return res.status(500).json({ error: 'Erro ao salvar. Tente novamente.' });
    }

    // Webhook dispatch (server-side). Payload shapes mirror what each form
    // used to send from the browser so n8n flows keep working unchanged.
    // Failure here must not fail the submission.
    try {
      const { data: settings } = await admin
        .from('site_settings')
        .select('key, value')
        .in('key', ['webhook_mode', 'webhook_prod_url', 'webhook_test_url']);
      const get = (k) => settings?.find((s) => s.key === k)?.value;
      const mode = get('webhook_mode') || 'test';
      const webhookUrl = mode === 'prod' ? get('webhook_prod_url') : get('webhook_test_url');

      if (webhookUrl) {
        let payload;
        if (formType === 'catalogo') {
          payload = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            city: data.city,
            source,
            submitted_at: data.submitted_at,
            utm_source: data.utm_source || '',
            utm_medium: data.utm_medium || '',
            utm_campaign: data.utm_campaign || '',
            utm_term: data.utm_term || '',
            utm_content: data.utm_content || '',
            utm_id: data.utm_id || '',
            executionMode: mode,
          };
        } else {
          payload = {
            form_type: formType,
            ...(formType === 'whatsapp' ? { form_name: 'WhatsApp Widget Site Principal' } : {}),
            name: data.name,
            email: data.email,
            phone: data.phone,
            client_type: data.client_type || '',
            segment: data.segment || '',
            message: data.message || '',
            products: data.products ? data.products.join(', ') : '',
            city: data.city || '',
            state: data.state || '',
            city_full: data.city ? `${data.city} - ${data.state || ''}`.replace(/ - $/, '') : '',
            source,
            submitted_at: data.submitted_at,
            utm_source: data.utm_source || '',
            utm_medium: data.utm_medium || '',
            utm_campaign: data.utm_campaign || '',
            utm_term: data.utm_term || '',
            utm_content: data.utm_content || '',
            utm_id: data.utm_id || '',
          };
        }
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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
