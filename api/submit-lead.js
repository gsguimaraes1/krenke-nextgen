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

// Goalfy CRM — board "ENTRADA DE LEAD 24/25/26" (bd2a3de4-5ce0-4d8e-9188-ba8590b85199).
// IDs validados via GET /api/boards em 2026-07-17; mesmo modelId usado pelo
// fluxo n8n "Meta Ads Lead Form Novo".
const GOALFY_API = 'https://api.goalfy.com.br/api';
const GOALFY_MODEL_ID = '44be45a2-40fd-4cbd-9a79-274a6a5b0101';
const GOALFY_FIELD = {
  name: '83712e9d-f849-4a70-9d08-3285b6f3606f',
  phone: '4d7ca3aa-31da-4027-b226-32942e7317ad',
  email: '1c80edc4-5c32-4bfa-ba4a-a6d49a2d237a',
  city: 'acf97bdf-f66a-4ec7-b169-ec303dba79fd',
  state: '5827f603-c4b9-4d6a-adde-094ef92b1479',
  pageUrl: '2289d1be-2d32-43e8-84f5-155acc2c4ef3',
  message: '99c4aaab-2296-47b5-9ba8-d56b2073ead4',
  modeloParque: '0f9b864e-0eb9-4ca4-829a-f44a69b91b41',
  utm_campaign: '3dc440b8-544e-4f4f-9aa5-e47a2e99edd7',
  utm_medium: 'e7961332-5835-4c04-b46b-73d3594fbd0f',
  utm_source: '6c077df9-eb40-4277-a136-b75946bc26fd',
  utm_keyword: '67ade46d-bf86-4468-bed9-4d244b7c55e2',
  // Campo que o fluxo do Meta Ads preenche com "Facebook". Não aparece na
  // listagem do board (pode ser lista com opções fixas) — enviado com retry:
  // se a criação falhar, tenta de novo sem ele.
  fonteLead: '35168640-800e-4d77-b307-9fb987254b04',
};
// Etiqueta "Site Novo Krenke", aplicada a todo card vindo do site.
const GOALFY_TAG_ID = 'bdb07724-0899-437d-8cdf-f4fda7d88321';

async function createGoalfyCard(data, formType, pageUrl) {
  const token = process.env.GOALFY_TOKEN;
  if (!token) {
    console.warn('GOALFY_TOKEN not set — skipping Goalfy card creation');
    return;
  }

  const messageParts = [];
  if (data.client_type) messageParts.push(`Tipo de cliente: ${data.client_type}`);
  if (data.segment) messageParts.push(`Segmento: ${data.segment}`);
  if (data.message) messageParts.push(data.message);
  const sourceLabel = { orcamento: 'Site - Orçamento', catalogo: 'Site - Catálogo', whatsapp: 'Site - WhatsApp Widget' }[formType];

  const push = (fields, key, value) => {
    if (value) fields.push({ value, fieldInfoId: GOALFY_FIELD[key] });
  };
  const baseFields = [];
  push(baseFields, 'name', data.name);
  push(baseFields, 'phone', data.phone.replace(/^\+/, ''));
  push(baseFields, 'email', data.email);
  push(baseFields, 'city', data.city);
  push(baseFields, 'state', data.state);
  push(baseFields, 'pageUrl', pageUrl);
  push(baseFields, 'message', [`[${sourceLabel}]`, ...messageParts].join('\n'));
  push(baseFields, 'modeloParque', data.products ? data.products.join(', ') : '');
  push(baseFields, 'utm_source', data.utm_source);
  push(baseFields, 'utm_medium', data.utm_medium);
  push(baseFields, 'utm_campaign', data.utm_campaign);
  push(baseFields, 'utm_keyword', data.utm_term);

  const attempt = async (fields) => {
    const r = await fetch(`${GOALFY_API}/cards/form/`, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        authorization: `Token ${token}`,
      },
      body: JSON.stringify({ modelId: GOALFY_MODEL_ID, fields }),
    });
    return r;
  };

  let resp = await attempt([...baseFields, { value: 'Site', fieldInfoId: GOALFY_FIELD.fonteLead }]);
  if (!resp.ok) {
    console.warn(`Goalfy create with fonteLead failed (${resp.status}) — retrying without it`);
    resp = await attempt(baseFields);
  }
  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`Goalfy card creation failed: ${resp.status} ${body.slice(0, 500)}`);
  }

  // Etiqueta o card criado. Falha aqui não invalida o card — só loga.
  try {
    const card = await resp.json();
    if (card?.id) {
      const tagResp = await fetch(`${GOALFY_API}/cards/${card.id}/addTag/${GOALFY_TAG_ID}`, {
        method: 'POST',
        headers: {
          accept: 'application/json, text/plain, */*',
          authorization: `Token ${token}`,
        },
      });
      if (!tagResp.ok) console.warn(`Goalfy addTag failed: ${tagResp.status}`);
    }
  } catch (err) {
    console.error('Goalfy addTag error:', err);
  }
}

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

    // CRM dispatch (server-side): cria o card direto na Goalfy, sem
    // intermediar via webhook n8n. Falha aqui não pode falhar o envio —
    // o lead já está salvo no banco.
    try {
      await createGoalfyCard(data, formType, opt(lead.page_url, 1000));
    } catch (err) {
      console.error('Goalfy dispatch error:', err);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit-lead error:', err);
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
}
