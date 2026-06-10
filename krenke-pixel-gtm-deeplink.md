# Krenke — Captação de Leads: Facebook Pixel, GTM e Deep Link

Documentação técnica completa da estratégia de rastreamento de leads via formulários do site, integração com Facebook Pixel via Google Tag Manager, solução de Deep Link para forçar abertura no navegador nativo (Safari/Chrome) quando o usuário vem de anúncios do Meta, e variáveis GTM auxiliares adaptadas ao contexto Krenke (B2B, sem e-commerce).

---

## Índice

1. [Visão geral da arquitetura](#1-visão-geral-da-arquitetura)
2. [Formulários do site](#2-formulários-do-site)
3. [Instalação do GTM no site React](#3-instalação-do-gtm-no-site-react)
4. [dataLayer — alterações nos formulários](#4-datalayer--alterações-nos-formulários)
5. [Configuração no painel do GTM](#5-configuração-no-painel-do-gtm)
6. [Variáveis GTM auxiliares — formatação e qualidade de dados](#6-variáveis-gtm-auxiliares--formatação-e-qualidade-de-dados)
7. [Deep Link — forçar abertura no navegador nativo](#7-deep-link--forçar-abertura-no-navegador-nativo)
8. [Checklist de publicação](#8-checklist-de-publicação)
9. [Próximos passos](#9-próximos-passos)

---

## 1. Visão geral da arquitetura

```
Anúncio Meta Ads
      │
      ▼
krenke.com.br/r?lnk=...   ← Página de redirect (Deep Link)
      │                       captura fbclid → cria cookie _fbc
      ▼ (abre no Safari ou Chrome, não no WebView do Facebook)
      │
krenke.com.br/orcamento   ←  QuoteForm.tsx
krenke.com.br (widget)    ←  WhatsAppWidget.tsx
      │
      ▼
Usuário preenche formulário
      │
      ├── INSERT → Supabase (tabela leads)
      ├── Webhook → prod/test URL (fire-and-forget)
      ├── dataLayer.push({ event: 'lead_orcamento' | 'lead_whatsapp' })
      │
      ▼
Google Tag Manager ouve o evento
      │
      ├── Tag: FB — Pixel Base        (PageView — todas as páginas)
      ├── Tag: FB — Captura fbclid    (All Pages — cria cookie _fbc)
      ├── Tag: FB — Lead Orçamento    (trigger: lead_orcamento)
      └── Tag: FB — Lead WhatsApp     (trigger: lead_whatsapp)
            │
            ▼
      Facebook Pixel
      ├── Evento Lead (conversão)
      ├── Advanced Matching (email, phone, nome, cidade)
      ├── Cookies fbp + fbc (melhor atribuição de anúncios)
      └── Público personalizado (remarketing + lookalike)
```

**Divisão de responsabilidades:**

| Camada | O que faz | Onde fica |
|---|---|---|
| Código do site | Instala GTM + empurra dataLayer | `index.html` + formulários |
| GTM | Carrega Pixel + dispara eventos + variáveis auxiliares | Painel GTM |
| Facebook Pixel | Registra conversões, públicos e cookies | Meta Events Manager |
| Deep Link `/r` | Força abertura no browser nativo + captura fbclid | Componente React `/r` |

> **Contexto:** Krenke é empresa B2B. Não há e-commerce, carrinho, checkout ou fluxo de compra. O único objetivo de rastreamento é a captação de leads via formulário de orçamento e widget de WhatsApp.

---

## 2. Formulários do site

### 2.1 QuoteForm (`components/QuoteForm.tsx`)

Formulário principal de orçamento. Renderizado em `pages/Quote.tsx`.

| Campo | Variável state | Formato do valor |
|---|---|---|
| Nome | `nameInput` | string |
| Email | `emailInput` | string lowercase |
| Telefone | `phone` | E.164 ex: `+5547999999999` |
| Cidade | `selectedCity` | `{ value: 'Cidade - UF', label: '...' }` |
| Tipo de cliente | `clientType` | `Pessoa Física` / `Pessoa Jurídica` / `Órgão Público` |
| Segmento | `segment` | `Hotel`, `Condominio`, `Escola Privada`, etc. |
| Segmento (outros) | `otherSegment` | string livre (quando segment === 'outros') |
| Produto | `selectedProducts` | array de IDs → convertido para array de nomes no payload |
| Mensagem | `messageInput` | string |

**Payload final enviado ao Supabase:**

```json
{
  "name": "string",
  "phone": "+5547999999999",
  "email": "email@lowercase.com",
  "city": "São Paulo - SP",
  "client_type": "Pessoa Jurídica",
  "segment": "Hotel",
  "message": "string",
  "products": ["Produto A", "Produto B"],
  "source": "Site Krenke - Orçamento",
  "submitted_at": "2025-01-01T00:00:00.000Z",
  "utm_source": "facebook",
  "utm_medium": "cpc",
  "utm_campaign": "...",
  "utm_term": "...",
  "utm_content": "..."
}
```

**Integrações existentes:**
- Supabase → tabela `leads` (INSERT com await)
- Webhook HTTP POST → URL dinâmica via `site_settings` no Supabase (fire-and-forget)
- UTMs → capturados via `lib/utm-tracker.ts` no `useEffect` de mount

**Ponto de inserção do dataLayer:** após `supabase.from('leads').insert([data])` ter sucesso, dentro do bloco `try`, linha ~213.

---

### 2.2 WhatsAppWidget (`components/WhatsAppWidget.tsx`)

Widget flutuante `fixed bottom-6 right-6`. Mini formulário de contato rápido que abre o WhatsApp após o submit.

| Campo | Variável state | Observação |
|---|---|---|
| Nome | `name` | string |
| Telefone | `phone` | **texto livre — sem E.164** — precisa de normalização antes do Pixel |
| Segmento | `segment` | mesmo enum do QuoteForm |
| Mensagem | `message` | string |

> **Campos ausentes vs QuoteForm:** email, cidade, tipo de cliente e produto não existem neste formulário — limita o Advanced Matching. A normalização do telefone é obrigatória (ver seção 6.1).

**Número WhatsApp:** `554733730693`

**Ação pós-submit:** abre `https://wa.me/554733730693?text=...` em nova aba.

**Atenção crítica:** o submit é síncrono (fire-and-forget, sem async/await). O `dataLayer.push` **deve vir antes** do `window.open()`, caso contrário o redirecionamento pode matar o evento antes de ser enviado.

**Ponto de inserção do dataLayer:** dentro do `.then()` do Supabase insert, antes do `window.open()`.

**Classes GTM já existentes no componente:**

| Elemento | Classe GTM | ID HTML |
|---|---|---|
| Container | `gtm-wa-widget-container` | — |
| Botão toggle | `gtm-wa-widget-toggle` | `btn-whatsapp-toggle` |
| Botão fechar | `gtm-wa-widget-close` | `btn-wa-widget-close` |
| Botão submit | `gtm-wa-widget-submit` | `form-wa-submit` |

---

## 3. Instalação do GTM no site React

**Uma única alteração no código** — depois tudo é gerenciado pelo painel GTM.

### 3.1 No `<head>` do `index.html`

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

### 3.2 No `<body>` logo após a tag de abertura

```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

> Substitua `GTM-XXXXXXX` pelo seu ID real de container GTM.

---

## 4. dataLayer — alterações nos formulários

### 4.1 QuoteForm.tsx — após linha ~213

Cole após `supabase.from('leads').insert([data])` ter sucesso, dentro do bloco `try`:

```typescript
// dataLayer push — Facebook Pixel via GTM
const eventId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'lead_orcamento',
  event_id: eventId,                              // deduplição Pixel + CAPI
  lead_email: data.email,                         // lowercase — já formatado
  lead_phone: data.phone,                         // E.164 (+5547...) — já formatado
  lead_first_name: data.name.split(' ')[0].toLowerCase(),
  lead_city: data.city.split(' - ')[0],           // "São Paulo - SP" → "São Paulo"
  lead_state: data.city.split(' - ')[1] ?? '',    // "SP"
  lead_segment: data.segment,
  lead_client_type: data.client_type,
  lead_products: data.products.join(', '),
  lead_source: data.source,
});
```

**Qualidade dos dados para Advanced Matching:**
- `email` → já em lowercase ✓
- `phone` → formato E.164 (`+5547...`) — ideal para hashing ✓
- `first_name` → extraído do nome completo ✓
- `city` / `state` → extraídos do formato `"São Paulo - SP"` ✓
- `country` → fixo `'br'` (definido na tag GTM) ✓
- `event_id` → garante deduplição se CAPI for implementada ✓

---

### 4.2 WhatsAppWidget.tsx — no `.then()` do Supabase, antes do `window.open()`

```typescript
.then(() => {
  // 1. dataLayer PRIMEIRO — obrigatoriamente antes do window.open()
  const eventId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'lead_whatsapp',
    event_id: eventId,
    lead_first_name: leadData.name.split(' ')[0].toLowerCase(),
    lead_phone: leadData.phone,   // texto livre — normalizado pela variável GTM (ver seção 6.1)
    lead_segment: leadData.segment,
    lead_source: leadData.source,
  });

  // 2. Abre WhatsApp depois
  window.open(`https://wa.me/554733730693?text=...`, '_blank');
});
```

> O telefone do WhatsApp Widget chega como texto livre (ex: `47999999999`). A normalização para `5547999999999` é feita pela variável GTM `jsp_phone_wa` descrita na seção 6.1 — não é necessário alterar o código do componente.

---

## 5. Configuração no painel do GTM

### 5.1 Variáveis de camada de dados

Criar em **Variáveis → Nova → Variável de camada de dados** para cada item:

| Nome da variável GTM | Nome na camada de dados |
|---|---|
| `dlv_lead_email` | `lead_email` |
| `dlv_lead_phone` | `lead_phone` |
| `dlv_lead_first_name` | `lead_first_name` |
| `dlv_lead_city` | `lead_city` |
| `dlv_lead_state` | `lead_state` |
| `dlv_lead_segment` | `lead_segment` |
| `dlv_lead_client_type` | `lead_client_type` |
| `dlv_lead_products` | `lead_products` |
| `dlv_lead_source` | `lead_source` |
| `dlv_event_id` | `event_id` |
| `dlv_phone_wa` | `lead_phone` (usada como entrada para `jsp_phone_wa`) |

---

### 5.2 Triggers

Criar em **Acionadores → Novo → Evento personalizado:**

| Nome do trigger | Tipo | Nome do evento |
|---|---|---|
| `Custom Event — lead_orcamento` | Evento personalizado | `lead_orcamento` |
| `Custom Event — lead_whatsapp` | Evento personalizado | `lead_whatsapp` |

---

### 5.3 Tags

#### Tag 1: FB — Pixel Base

| Campo | Valor |
|---|---|
| Nome | `FB — Pixel Base` |
| Tipo | HTML personalizado |
| Acionador | All Pages (Pageview) |

```html
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'SEU_PIXEL_ID');
fbq('track', 'PageView');
</script>
```

---

#### Tag 2: FB — Captura fbclid (All Pages)

Deve disparar em todas as páginas, inclusive na `/r` (Deep Link). Cria o cookie `_fbc` a partir do `fbclid` da URL, permitindo atribuição correta de anúncios mesmo quando o Pixel ainda não disparou.

| Campo | Valor |
|---|---|
| Nome | `FB — Captura fbclid` |
| Tipo | HTML personalizado |
| Acionador | All Pages (Pageview) |

```html
<script>
(function() {
  var fbclid = (new URLSearchParams(window.location.search)).get('fbclid');
  if (!fbclid) return;

  var tsMs = Date.now();
  var fbc = 'fb.1.' + tsMs + '.' + fbclid;

  // Salva como cookie _fbc (90 dias)
  document.cookie = '_fbc=' + encodeURIComponent(fbc) +
    '; domain=.krenke.com.br' +
    '; path=/' +
    '; max-age=7776000' +
    '; SameSite=Lax; Secure';

  // Fallback em sessionStorage
  try { sessionStorage.setItem('fbc_fallback', fbc); } catch(e) {}
})();
</script>
```

---

#### Tag 3: FB — Lead Orçamento

| Campo | Valor |
|---|---|
| Nome | `FB — Lead Orçamento` |
| Tipo | HTML personalizado |
| Acionador | `Custom Event — lead_orcamento` |

```html
<script>
fbq('init', 'SEU_PIXEL_ID', {
  em: {{dlv_lead_email}},
  ph: {{dlv_lead_phone}},
  fn: {{dlv_lead_first_name}},
  ct: {{dlv_lead_city}},
  st: {{dlv_lead_state}},
  country: 'br',
});
fbq('track', 'Lead', {
  content_category: {{dlv_lead_segment}},
  content_name:     {{dlv_lead_products}},
  content_type:     {{dlv_lead_client_type}},
  value:    0,
  currency: 'BRL',
}, { eventID: {{dlv_event_id}} });
</script>
```

---

#### Tag 4: FB — Lead WhatsApp

| Campo | Valor |
|---|---|
| Nome | `FB — Lead WhatsApp` |
| Tipo | HTML personalizado |
| Acionador | `Custom Event — lead_whatsapp` |

```html
<script>
fbq('init', 'SEU_PIXEL_ID', {
  fn:      {{dlv_lead_first_name}},
  ph:      {{jsp_phone_wa}},   // variável GTM que normaliza o telefone (seção 6.1)
  country: 'br',
});
fbq('track', 'Lead', {
  content_category: {{dlv_lead_segment}},
  content_name:     'WhatsApp Widget',
  value:    0,
  currency: 'BRL',
}, { eventID: {{dlv_event_id}} });
</script>
```

---

### 5.4 Públicos recomendados no Meta Ads Manager

Criar em **Públicos → Criar público → Público personalizado → Site:**

| Nome do público | Regra | Janela |
|---|---|---|
| Visitantes do site (todos) | Evento: PageView | 30 dias |
| Visitou /orcamento sem converter | URL contém `/orcamento` — excluir evento Lead | 30 dias |
| Leads convertidos (todos os forms) | Evento: Lead | 180 dias |
| Lookalike de leads | Baseado no público de leads | — |

---

### 5.5 Deduplição Pixel + CAPI

O `event_id` já está sendo gerado e enviado no `dataLayer.push` (seção 4). Quando a CAPI for implementada via webhook, basta incluir o mesmo `event_id` no payload enviado ao servidor. O Meta deduplica automaticamente — evita contar o mesmo lead duas vezes.

```typescript
// No payload do webhook (já existente no projeto)
{
  event_name: 'Lead',
  event_time: Math.round(Date.now() / 1000),  // timestamp Unix (ver seção 6.3)
  event_id: eventId,                           // mesmo gerado no dataLayer.push
  user_data: {
    em: hashSHA256(data.email),
    ph: hashSHA256(data.phone),
    fn: hashSHA256(data.name.split(' ')[0].toLowerCase()),
    ct: hashSHA256(data.city.split(' - ')[0].toLowerCase()),
    country: hashSHA256('br'),
  },
  custom_data: {
    content_category: data.segment,
    content_name: data.products.join(', '),
  }
}
```

---

## 6. Variáveis GTM auxiliares — formatação e qualidade de dados

Estas variáveis JavaScript personalizada (JSP) são criadas em **Variáveis → Nova → JavaScript personalizado** no GTM. Resolvem problemas específicos do contexto Krenke sem precisar alterar o código do site.

---

### 6.1 `jsp_phone_wa` — normalizar telefone do WhatsAppWidget

**Problema:** o WhatsApp Widget armazena o telefone como texto livre (`47999999999`). O Facebook exige o formato `5547999999999` (sem `+`, com DDI) para o Advanced Matching.

```javascript
function() {
  var telefone = {{dlv_phone_wa}};  // variável de camada de dados: lead_phone
  if (!telefone) return '';

  // Converte para string e remove tudo que não for número
  telefone = telefone.toString().replace(/\D/g, '');

  // Se já começa com 55, mantém; se não, adiciona
  if (telefone.indexOf('55') === 0) {
    return telefone;
  }
  return '55' + telefone;
}
```

> Para o QuoteForm esta variável não é necessária — o telefone já vem em E.164 (`+5547...`). Para o QuoteForm use `{{dlv_lead_phone}}` diretamente, apenas removendo o `+` se necessário (ver `jsp_phone_quote` abaixo).

---

### 6.2 `jsp_phone_quote` — remover o `+` do E.164 do QuoteForm

**Problema:** o telefone do QuoteForm vem como `+5547999999999` (com `+`). O Facebook no Advanced Matching espera `5547999999999` (sem `+`).

```javascript
function() {
  var telefone = {{dlv_lead_phone}};
  if (!telefone) return '';
  return telefone.toString().replace('+', '');
}
```

> Use `{{jsp_phone_quote}}` no lugar de `{{dlv_lead_phone}}` nas tags FB — Lead Orçamento.

---

### 6.3 `jsp_event_timestamp` — timestamp Unix para CAPI

**Uso:** parâmetro `event_time` obrigatório na Conversions API do Facebook. Retorna o horário atual em segundos Unix.

```javascript
function() {
  return Math.round(new Date().getTime() / 1000);
}
```

---

### 6.4 `jsp_fbc` — recuperar cookie `_fbc` para CAPI

**Uso:** quando a CAPI for implementada via webhook, esse cookie precisa ser enviado junto ao payload para melhorar a atribuição de cliques em anúncios.

```javascript
function() {
  // 1. Tenta pegar da URL (clique recém-acontecido)
  var fbclid = (new URLSearchParams(window.location.search)).get('fbclid');
  if (fbclid) {
    return 'fb.1.' + Date.now() + '.' + fbclid;
  }

  // 2. Tenta pegar do cookie _fbc
  var match = document.cookie.match(/(?:^|;\s*)_fbc=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);

  // 3. Fallback: sessionStorage
  try {
    var ss = sessionStorage.getItem('fbc_fallback');
    if (ss) return ss;
  } catch(e) {}

  return '';
}
```

---

### 6.5 `jsp_city_normalized` — remover acentos da cidade para Advanced Matching

**Problema:** o Facebook exige cidade sem acentos no Advanced Matching. `"São Paulo"` deve ser enviado como `"sao paulo"`.

```javascript
function() {
  var cidade = {{dlv_lead_city}};
  if (!cidade) return '';
  return cidade
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
```

> Use `{{jsp_city_normalized}}` no parâmetro `ct` das tags FB no lugar de `{{dlv_lead_city}}`.

---

### 6.6 Resumo das variáveis GTM a criar

| Nome da variável | Tipo | Usado em |
|---|---|---|
| `dlv_lead_email` | Camada de dados | Tags Lead Orçamento |
| `dlv_lead_phone` | Camada de dados | `jsp_phone_quote` |
| `dlv_lead_first_name` | Camada de dados | Tags Lead (ambos) |
| `dlv_lead_city` | Camada de dados | `jsp_city_normalized` |
| `dlv_lead_state` | Camada de dados | Tag Lead Orçamento |
| `dlv_lead_segment` | Camada de dados | Tags Lead (ambos) |
| `dlv_lead_client_type` | Camada de dados | Tag Lead Orçamento |
| `dlv_lead_products` | Camada de dados | Tag Lead Orçamento |
| `dlv_lead_source` | Camada de dados | Opcional / debug |
| `dlv_event_id` | Camada de dados | Tags Lead (ambos) — deduplição |
| `dlv_phone_wa` | Camada de dados | `jsp_phone_wa` |
| `jsp_phone_wa` | JavaScript personalizado | Tag Lead WhatsApp |
| `jsp_phone_quote` | JavaScript personalizado | Tag Lead Orçamento |
| `jsp_event_timestamp` | JavaScript personalizado | CAPI (webhook) |
| `jsp_fbc` | JavaScript personalizado | CAPI (webhook) |
| `jsp_city_normalized` | JavaScript personalizado | Tag Lead Orçamento |

---

## 7. Deep Link — forçar abertura no navegador nativo

> **⚠️ DECISÃO ARQUITETURAL:** O Deep Link **será implementado via GTM** (tag HTML personalizada), não via componente React em `/r`. O componente `pages/Redirect.tsx` documentado abaixo é a abordagem alternativa — **não implementar**. Seguir a seção 7.7 (GTM).



### 7.1 Por que é necessário

Quando o usuário clica em um anúncio do Meta (Facebook ou Instagram), o link abre dentro do **WebView embutido** do app. Esse browser interno tem restrições sérias:

- Cookies de terceiros bloqueados — afeta o Pixel e o cookie `_fbc`
- `fbclid` não persiste corretamente
- iOS bloqueia rastreamento via App Tracking Transparency
- Formulários longos (como o QuoteForm B2B) têm maior taxa de abandono no WebView

Forçar a abertura no Safari ou Chrome resolve todos esses problemas e melhora significativamente a qualidade do sinal do Pixel.

### 7.2 Funcionamento

Os anúncios Meta não apontam diretamente para `krenke.com.br/orcamento`. Apontam para a página intermediária `/r`:

```
https://krenke.com.br/r?lnk=https://krenke.com.br/orcamento&utm_source=facebook&utm_medium=cpc&utm_campaign=nome_campanha&utm_content=nome_criativo&fbclid=XXXXX
```

Essa página:
1. Detecta se está num WebView
2. Força abertura no browser nativo (Chrome/Safari)
3. Preserva todos os parâmetros UTM e o `fbclid` na URL final
4. O `fbclid` é então capturado pela Tag 2 do GTM (`FB — Captura fbclid`) e salvo como cookie `_fbc`

### 7.3 Componente React — `pages/Redirect.tsx`

Criar a rota `/r` no React Router com um componente dedicado. **Não usar o script original diretamente** — o `document.body.innerHTML` do script original quebraria o app React ao sobrescrever toda a DOM.

```tsx
// pages/Redirect.tsx
import { useEffect } from 'react';

function getParam(name: string): string | null {
  const match = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.href);
  return match ? decodeURIComponent(match[1]) : null;
}

function getAllParamsExceptLnk(): string {
  const query = window.location.search.substring(1);
  return query
    .split('&')
    .filter(p => p && !p.startsWith('lnk='))
    .join('&');
}

function isInWebView(): boolean {
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /FBAN|FBAV|Instagram|Messenger|Line|Snapchat|TikTok/.test(ua);
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function Redirect() {
  const baseLink = getParam('lnk');
  const extraParams = getAllParamsExceptLnk();
  const finalLink = baseLink
    ? baseLink + (extraParams ? (baseLink.includes('?') ? '&' : '?') + extraParams : '')
    : null;

  useEffect(() => {
    if (!finalLink) return;

    if (isInWebView()) {
      if (isAndroid()) {
        // Abre no Chrome (Android)
        const intentLink =
          'intent://' +
          finalLink.replace(/^https?:\/\//, '') +
          '#Intent;scheme=https;package=com.android.chrome;end';
        window.location.href = intentLink;
      } else if (isIOS()) {
        // x-safari — método legado, funciona na maioria dos casos
        // Botão manual abaixo é o fallback para iOS 16+ que bloqueie
        window.location.href = 'x-safari-' + finalLink;
      } else {
        window.location.href = finalLink;
      }
    } else {
      // Não está em WebView — redireciona após breve delay
      setTimeout(() => {
        window.location.href = finalLink;
      }, 800);
    }
  }, [finalLink]);

  if (!finalLink) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '30px', textAlign: 'center' }}>
        <p>Link inválido.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '30px', textAlign: 'center' }}>
      <p style={{ marginBottom: '15px' }}>
        Se você não for redirecionado automaticamente, toque no botão abaixo para abrir no navegador.
      </p>
      <a
        href={finalLink}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-block',
          background: '#007aff',
          color: '#fff',
          padding: '10px 20px',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '16px',
        }}
      >
        Abrir no Navegador
      </a>
    </div>
  );
}
```

### 7.4 Registrar a rota no React Router

```tsx
// App.tsx ou routes.tsx
import Redirect from './pages/Redirect';

// Dentro do seu Router:
<Route path="/r" element={<Redirect />} />
```

### 7.5 Pontos de atenção

| Ponto | Status | Observação |
|---|---|---|
| Detecção de WebView (FB, IG, TikTok) | ✓ Correto | Cobre os principais apps |
| Intent Android para Chrome | ✓ Correto | `package=com.android.chrome` |
| `x-safari-` para iOS | ⚠️ Legado | Pode ser bloqueado no iOS 16+ — botão manual é o fallback confiável |
| `document.body.innerHTML` no script original | ✗ Não usar | Quebra o React — usar componente isolado conforme seção 7.3 |
| Passagem de UTMs | ✓ Correto | `getAllParamsExceptLnk()` preserva todos os parâmetros |
| Passagem do `fbclid` | ✓ Correto | Incluído nos `extraParams` — capturado pelo GTM ao chegar no site |
| Botão de fallback manual | ✓ Essencial | Manter sempre — método mais confiável no iOS |

### 7.6 Formato do link nos anúncios Meta

```
https://krenke.com.br/r?lnk=https://krenke.com.br/orcamento&utm_source=facebook&utm_medium=cpc&utm_campaign=nome_campanha&utm_content=nome_criativo
```

> O `fbclid` é adicionado automaticamente pelo Meta ao link quando o usuário clica no anúncio — não precisa ser incluído manualmente.

---

## 8. Checklist de publicação

### Código do site
- [x] GTM snippet instalado no `<head>` do `index.html` (ID: `GTM-MVZ7JB2F`)
- [x] GTM noscript instalado no `<body>` do `index.html`
- [x] `dataLayer.push` com `event_id` adicionado ao `QuoteForm.tsx`
- [x] `dataLayer.push` com `event_id` adicionado ao `WhatsAppWidget.tsx` (antes do `window.open`)
- [x] Payload do webhook normalizado em ambos os formulários (city/state pré-separados, campos vazios como string)
- [ ] Componente `pages/Redirect.tsx` criado ← **pendente**
- [ ] Rota `/r` registrada no React Router ← **pendente**

### GTM (painel) — Container `GTM-MVZ7JB2F`
- [x] 10 variáveis DLV criadas (`dlv_event_id`, `dlv_lead_email`, `dlv_lead_phone`, `dlv_lead_first_name`, `dlv_lead_city`, `dlv_lead_state`, `dlv_lead_segment`, `dlv_lead_client_type`, `dlv_lead_products`, `dlv_lead_source`)
- [x] 5 variáveis JSP criadas (`jsp_phone_quote`, `jsp_phone_wa`, `jsp_city_normalized`, `jsp_event_timestamp`, `jsp_fbc`)
- [x] 2 triggers de evento personalizado criados (`lead_orcamento`, `lead_whatsapp`)
- [x] Tag `FB — Captura fbclid` criada (All Pages)
- [x] Tag `FB — Lead Orçamento` criada — disparo validado no GTM Preview ✓
- [x] Tag `FB — Lead WhatsApp` criada — disparo validado no GTM Preview ✓
- [x] Advanced Matching com `st` (estado) e `country: 'br'` configurados em ambas as tags
- [ ] ID do Pixel substituído na variável `Pixel - Facebook` (atualmente `123`) ← **pendente**
- [ ] ID do Google Ads substituído na variável `Google Ads ID` (atualmente `Gads123`) ← **pendente**
- [ ] Versão publicada no GTM ← **pendente após atualizar IDs**

### Facebook / Meta
- [ ] ID do Pixel atualizado no GTM
- [ ] Evento Lead verificado no Meta Events Manager (Test Events)
- [ ] Advanced Matching verificado — campos `em`, `ph`, `fn`, `ct`, `st`, `country` chegando
- [ ] Cookie `_fbc` sendo criado ao acessar via link com `fbclid`
- [ ] Públicos personalizados criados (visitantes, leads, lookalike)

### Deep Link
- [ ] Componente `pages/Redirect.tsx` implementado (ver seção 7.3)
- [ ] Rota `/r` registrada no `App.tsx`
- [ ] URL de destino dos anúncios atualizada para `krenke.com.br/r?lnk=...`
- [ ] Testado no celular Android (Chrome) via anúncio do Facebook
- [ ] Testado no celular iOS (Safari) via anúncio do Instagram
- [ ] Botão de fallback manual funcionando
- [ ] `fbclid` preservado na URL final após o redirect

---

## 9. Próximos passos

- **[IMEDIATO] Publicar GTM:** atualizar `Pixel - Facebook` e `Google Ads ID` com valores reais → Enviar versão no GTM.
- **[IMEDIATO] Deep Link `/r`:** criar `pages/Redirect.tsx` (código na seção 7.3) e registrar rota no `App.tsx`. Usar nos links dos anúncios Meta.
- **GTM Server-Side + Cookie 1st-party:** subir container server-side (Cloud Run ou Stape.io) com domínio `metrics.krenke.com.br`. Cookies `_fbp`/`_fbc` como 1st-party sobrevivem ao ITP do Safari (que limita cookies 3rd-party a 7 dias).
- **Conversions API (CAPI):** envio server-side via webhook n8n existente. O `event_id` já está sendo gerado em ambos os formulários e o `jsp_fbc` + `jsp_event_timestamp` já estão preparados no GTM. Melhora qualidade do sinal especialmente pós-iOS 14.
- **iOS Deep Link:** avaliar substituição do `x-safari-` por solução mais robusta para iOS 16+ — botão manual como método primário com timeout de 300ms antes de tentar o redirect.
- **Testar Advanced Matching:** após publicar, verificar no Meta Events Manager se os campos chegam com hashing SHA-256 correto. Checar `ph` para os dois formulários (QuoteForm em E.164, WhatsApp em texto livre normalizado pela `jsp_phone_wa`).
- **UTM Tracker no WhatsAppWidget:** `getStoredUTMs()` é chamado no submit, não no mount — confirmar se captura UTMs de Deep Link quando usuário navega entre páginas antes de abrir o widget.
- **Email opcional no WhatsAppWidget:** campo de email melhoraria o Advanced Matching do widget significativamente.

---

---

## 7.7 Deep Link via GTM ← **PRÓXIMA SESSÃO: CONTINUAR AQUI**

### Contexto
Os anúncios Meta abrem no WebView embutido do Facebook/Instagram, que bloqueia cookies e prejudica o rastreamento. A solução é forçar a abertura no Chrome (Android) ou Safari (iOS) antes de o usuário chegar no site.

**Decisão:** usar GTM (tag HTML personalizada) em vez de componente React. Vantagem: zero deploy de código, tudo gerenciado no painel GTM.

### Como funciona
O link do anúncio aponta para `https://site.krenke.com.br/orcamento?utm_source=...&fbclid=...`. O GTM detecta se está num WebView e redireciona para o browser nativo **antes** de renderizar a página.

### Tag GTM a criar

**Nome:** `Deep Link — Forçar Browser Nativo`
**Tipo:** HTML personalizado
**Acionador:** All Pages (Pageview) — disparar em todas as páginas

```html
<script>
(function() {
  var ua = navigator.userAgent || '';
  var isWebView = /FBAN|FBAV|Instagram|Messenger|Line|Snapchat|TikTok/.test(ua);
  if (!isWebView) return;

  var url = window.location.href;
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (isAndroid) {
    // Abre no Chrome via Android Intent
    window.location.href = 'intent://' +
      url.replace(/^https?:\/\//, '') +
      '#Intent;scheme=https;package=com.android.chrome;end';
  } else if (isIOS) {
    // x-safari — funciona na maioria dos casos iOS
    window.location.href = 'x-safari-' + url;
  }
})();
</script>
```

### Pontos de atenção ao implementar
- **Testar no celular real** clicando num anúncio — não dá para simular no desktop
- **iOS 16+:** o `x-safari-` pode ser bloqueado. Se falhar, avaliar solução com botão de fallback (ver seção 7.3 — componente React como plano B)
- **Ordem de disparo:** esta tag deve disparar **antes** das outras tags de pageview (definir prioridade alta, ex: 10)
- **fbclid preservado:** como a URL não muda (só o browser muda), o `fbclid` permanece na URL e é capturado normalmente pela tag `FB — Captura fbclid`
- **Não conflita** com nenhuma tag existente — apenas redireciona se for WebView

### Checklist Deep Link
- [ ] Tag `Deep Link — Forçar Browser Nativo` criada no GTM
- [ ] Prioridade da tag definida como `10` (maior que as demais)
- [ ] Testado no Android via anúncio do Facebook (deve abrir Chrome)
- [ ] Testado no iOS via anúncio do Instagram (deve abrir Safari)
- [ ] `fbclid` presente na URL após o redirect
- [ ] Cookie `_fbc` sendo criado após o redirect
- [ ] Publicar versão GTM após validação

---

*Documentação gerada em junho de 2026 — Krenke / Grupo Samuel*
*Status: GTM client-side implementado e validado em Preview. Pendente: Pixel ID real, publicação GTM, Deep Link (seção 7.7), Server-Side GTM.*
