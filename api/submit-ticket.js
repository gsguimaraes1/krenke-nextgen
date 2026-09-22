import { setCors, supabaseAdmin, verifyTurnstile, callerIp, sendEmail } from './_utils.js';

// Public ticket submission (/abrir-chamado). Verifies Turnstile and inserts
// with the service role — same pattern as submit-lead.js.

const CATEGORIES = ['instalacao', 'manutencao', 'garantia', 'duvida', 'reclamacao', 'outro'];

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { captchaToken, ticket, attachments: rawAttachments } = req.body || {};

    if (!ticket || typeof ticket !== 'object') {
      return res.status(400).json({ error: 'Dados inválidos.' });
    }

    if (!(await verifyTurnstile(captchaToken, callerIp(req)))) {
      return res.status(403).json({ error: 'Falha na verificação anti-bot. Recarregue a página e tente novamente.' });
    }

    const str = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    const opt = (v, max) => str(v, max) || null;
    const data = {
      title: str(ticket.title, 200),
      description: opt(ticket.description, 5000),
      category: CATEGORIES.includes(ticket.category) ? ticket.category : 'outro',
      priority: 'media',
      status: 'novo',
      source: 'publico',
      client_name: str(ticket.client_name, 200),
      client_email: str(ticket.client_email, 200).toLowerCase(),
      client_phone: str(ticket.client_phone, 30),
      client_city: opt(ticket.client_city, 120),
      client_state: opt(ticket.client_state, 2),
      product_name: opt(ticket.product_name, 200),
      order_reference: opt(ticket.order_reference, 100),
    };

    if (data.title.length < 3) return res.status(400).json({ error: 'Assunto inválido.' });
    if (!data.description) return res.status(400).json({ error: 'Descreva o problema.' });
    if (data.client_name.length < 3) return res.status(400).json({ error: 'Nome inválido.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.client_email)) return res.status(400).json({ error: 'E-mail inválido.' });
    if (!data.client_phone) return res.status(400).json({ error: 'Telefone inválido.' });

    const admin = supabaseAdmin();
    const { data: inserted, error } = await admin.from('sac_tickets').insert([data]).select('id, ticket_number').single();
    if (error) {
      console.error('Ticket insert error:', error);
      return res.status(500).json({ error: 'Erro ao salvar. Tente novamente.' });
    }

    // Anexos já foram enviados ao R2 (api/upload-attachment.js) antes deste
    // POST — aqui só grava as referências, até 5 por chamado.
    const attachments = Array.isArray(rawAttachments)
      ? rawAttachments
        .filter((a) => a && typeof a.file_url === 'string' && typeof a.file_name === 'string')
        .slice(0, 5)
        .map((a) => ({
          ticket_id: inserted.id,
          file_url: str(a.file_url, 1000),
          file_name: str(a.file_name, 300),
          file_size: Number.isFinite(a.file_size) ? a.file_size : null,
          content_type: opt(a.content_type, 100),
        }))
      : [];
    if (attachments.length) {
      const { error: attachError } = await admin.from('sac_ticket_attachments').insert(attachments);
      if (attachError) console.error('Attachment insert error:', attachError);
    }

    // Notificação pra equipe SAC — falha aqui não invalida o chamado, já salvo.
    if (process.env.SAC_NOTIFY_EMAIL) {
      const appUrl = process.env.SITE_URL || 'https://site.krenke.com.br';
      sendEmail({
        to: process.env.SAC_NOTIFY_EMAIL,
        subject: `Novo chamado SAC: ${data.title} (${inserted.ticket_number})`,
        text: [
          `Chamado: ${inserted.ticket_number}`,
          `Categoria: ${data.category}`,
          `Cliente: ${data.client_name} — ${data.client_email} — ${data.client_phone}`,
          '',
          data.description || '',
          '',
          `${appUrl}/sac`,
        ].join('\n'),
      }).catch((err) => console.error('notify email dispatch error:', err));
    }

    return res.status(200).json({ ok: true, ticket_number: inserted.ticket_number });
  } catch (err) {
    console.error('submit-ticket error:', err);
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
}
