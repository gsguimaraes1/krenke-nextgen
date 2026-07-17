import { setCors, supabaseAdmin, verifyTurnstile, callerIp } from './_utils.js';

// Public job-application submission. Replaces the direct anon insert into
// `job_applications`: verifies Turnstile, inserts with the service role and
// fires the n8n webhook server-side. The CV itself is uploaded separately via
// /api/upload-to-r2 (public path limited to PDF ≤ 5MB in the `curriculos` folder).
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { captchaToken, application } = req.body || {};
    if (!application || typeof application !== 'object') {
      return res.status(400).json({ error: 'Dados inválidos.' });
    }

    if (!(await verifyTurnstile(captchaToken, callerIp(req)))) {
      return res.status(403).json({ error: 'Falha na verificação anti-bot. Recarregue a página e tente novamente.' });
    }

    const str = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    const opt = (v, max) => str(v, max) || null;
    const data = {
      opening_id: opt(application.opening_id, 100),
      name: str(application.name, 200),
      email: str(application.email, 200).toLowerCase(),
      phone: str(application.phone, 30),
      city: str(application.city, 120),
      state: str(application.state, 2),
      application_type: str(application.application_type, 100) || 'Candidatura Espontânea',
      experience: opt(application.experience, 5000),
      education: opt(application.education, 100),
      salary_expectation: opt(application.salary_expectation, 200),
      motivation: opt(application.motivation, 5000),
      message: opt(application.message, 5000),
      cv_url: opt(application.cv_url, 1000),
      utm_source: opt(application.utm_source, 200),
      utm_medium: opt(application.utm_medium, 200),
      utm_campaign: opt(application.utm_campaign, 200),
      utm_term: opt(application.utm_term, 200),
      utm_content: opt(application.utm_content, 200),
      utm_id: opt(application.utm_id, 200),
    };

    if (data.name.length < 3) return res.status(400).json({ error: 'Nome inválido.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return res.status(400).json({ error: 'E-mail inválido.' });
    if (!data.phone) return res.status(400).json({ error: 'Telefone inválido.' });

    const admin = supabaseAdmin();
    const { error } = await admin.from('job_applications').insert([data]);
    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Você já enviou uma candidatura para esta vaga. Aguarde nosso contato!' });
      }
      console.error('Application insert error:', error);
      return res.status(500).json({ error: 'Erro ao enviar candidatura. Tente novamente.' });
    }

    // Webhook dispatch (server-side). Failure here must not fail the submission.
    try {
      await fetch('https://n8n.krenke.com.br/webhook/trabalhe-conosco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          form_type: 'trabalhe-conosco',
          source: 'Site Krenke - Trabalhe Conosco',
          submitted_at: new Date().toISOString(),
          city_full: `${data.city} - ${data.state}`,
          opening_title: opt(application.opening_title, 300),
          contract_types: Array.isArray(application.contract_types)
            ? application.contract_types.slice(0, 10).map((c) => str(c, 100))
            : [],
        }),
      });
    } catch (err) {
      console.error('Application webhook error:', err);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit-application error:', err);
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
}
