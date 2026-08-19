# CLAUDE.md — Krenke Brinquedos (site + painel)

Guia de retroalimentação para o Claude Code. Site institucional + catálogo + painel
admin da Krenke Brinquedos. Mantenha este arquivo atualizado quando a arquitetura mudar.

## Stack

- **Frontend:** React 19, Vite 6, React Router 7, TypeScript ~5.8, Tailwind CSS v4 (`@tailwindcss/vite`).
- **Backend:** Vercel serverless functions em `api/*.js` (Node, ESM). Não há servidor próprio.
- **Dados/Auth:** Supabase (Postgres + Auth). Project ref: `rkimlgpwshntyzaoqxpb`.
- **Storage:** Cloudflare R2 (via `api/*` com AWS SDK S3). Domínio público `s3.krenke.com.br`.
- **Hospedagem:** Vercel. Deploy dispara no push pra `main` (branch de produção). Domínio: `krenke.com.br`.
- **Libs notáveis:** framer-motion, lucide-react, react-quill-new (editor), dompurify (`lib/sanitize.ts`),
  react-i18next (pt/en/es), @marsidev/react-turnstile, jspdf/react-pdf/react-pageflip (catálogo), react-select, react-phone-number-input.

## Comandos

- `npm run dev` — Vite dev server na porta **3000** (host 0.0.0.0).
- `npm run build` — `vite build` (esbuild/terser). **Não roda `tsc`** → erros de tipo/var-não-usada NÃO quebram o build.
- `npm run preview` — serve o build.
- Ambiente: **Windows + PowerShell**. Bash tool disponível pra scripts POSIX.

## Build (vite.config.ts)

- Alias `@` → raiz do projeto.
- `drop_console: true` em produção (terser remove `console.*`).
- `manualChunks`: vendor-react, vendor-motion, vendor-lucide, vendor-supabase.
- Proxy dev `/translate_api` → `translate.googleapis.com` (Google Translate).
- Entry: `index.tsx` → `App.tsx` (raiz, **não** há `src/`).

## Rotas & papéis (App.tsx)

Papéis (`profiles.role`, tipo `UserRole`): `super` | `restricted` | `reseller` | `hr` | `mkt`.

Autorização client-side via `context/AuthContext.tsx` + `components/ProtectedRoute.tsx`
(`allowedRoles` e `allowedUserIds` p/ allowlist por conta). **Sem perfil = sem papel** —
não há mais fallback de papel no cliente (autorização real vive no RLS/servidor).

| Rota | Acesso |
|------|--------|
| `/`, `/empresa`, `/produtos`, `/blog`, `/projetos`, `/downloads`, `/catalogo`, `/orcamento`, `/trabalhe-conosco`, `/:slug` (DynamicPage) | público (Layout) |
| `/lp`, `/obrigado`, `/obrigado-curriculo` | público, sem Layout |
| `/login` | público — página de auth (`pages/Auth.tsx`) |
| `/pgadmin/*` | **painel admin** (`pages/Admin.tsx`) — `super`, `hr` |
| `/pgadmin/relatorio-orcamentos` | dentro do painel — **só `super`** (`components/QuoteReportView.tsx`) |
| `/revendedor` | `super`, `reseller` (`reseller-area/pages/ResellerArea.tsx`) |
| `/marketing` | `super`, `mkt` |
| `/relatorio` | `super` **+ allowlist de userIds** (PowerBI) |

> "pgadmin" = painel admin PRÓPRIO da Krenke (`/pgadmin`), NÃO o dashboard do Supabase nem pgAdmin do Postgres.

## API endpoints (`api/*.js`)

Padrão de auth em `api/_utils.js`: `setCors` (CORS travado em `*.krenke.com.br` e `*krenke*.vercel.app`),
`supabaseAdmin()` (service role), `verifyTurnstile(token, ip)`, `getCallerRole`, `requireRole`.
Ações privilegiadas do painel rodam **server-side** com service role (bypassa captcha e RLS).

| Endpoint | Auth | Função |
|----------|------|--------|
| `create-user.js` | Bearer + `super` | `admin.inviteUserByEmail` + seta profile |
| `delete-user.js` | Bearer + `super` | `admin.deleteUser` |
| `resend-invite.js` | Bearer + `super` | reenvia convite |
| `submit-lead.js` | público + Turnstile | insere `leads` + cria card na **Goalfy** (CRM) |
| `submit-application.js` | público + Turnstile | candidatura de vaga (`job_applications`) |
| `report-url.js` | Bearer + allowlist userIds | resolve URL PowerBI (não expõe no bundle) |
| `upload-to-r2.js`, `r2-ops.js`, `r2-sync.js` | ⚠️ ver auditoria | R2 upload/delete/sync |
| `proxy-logo.js` | n/a | fetch estático |

## Banco (Supabase, schema `public`, RLS habilitado em todas)

`profiles` (papéis, FK `id`→`auth.users` **ON DELETE CASCADE**), `products`, `calculator_products`,
`leads` (461+), `posts` (blog), `app_scripts` (scripts injetados via `ScriptInjector`), `site_settings`,
`reseller_folders`/`reseller_files` (área revendedor), `job_openings`/`job_applications` (RH),
`orcamento_revendas` (log de orçamentos da calculadora do revendedor — DDL em `sql/orcamento_revendas.sql`;
RLS: dono OU `public.is_super_admin()`; `upsert` por `quote_number`, então reeditar não gera linha nova),
`associated_resellers` (lista manual de revendas p/ campo "Revendedor Associado" da calculadora — DDL em
`sql/associated_resellers.sql`; select livre p/ autenticado, insert só allowlist fixa + `super`, update/delete só `super`).

- **Ferramentas Supabase disponíveis via MCP** (`Supabase- Krenke Brinquedos`): `execute_sql`,
  `apply_migration`, `list_tables`, `get_advisors`, `get_logs` etc. Use pra inspecionar/alterar o banco.

## Integrações

- **Goalfy CRM** — leads viram cards direto na Goalfy (`submit-lead.js`); board "ENTRADA DE LEAD",
  etiqueta "Site Novo Krenke". IDs de campos/model hardcoded no arquivo. Env: `GOALFY_TOKEN`.
- **Cloudflare Turnstile** — captcha. Mesma site key (`VITE_TURNSTILE_SITE_KEY`) em login + forms
  públicos (Quote, JobApplication, WhatsApp, Catálogo). Verificação server-side em `verifyTurnstile`
  (`TURNSTILE_SECRET_KEY`). Supabase Auth usava Turnstile como provider de captcha (mesma secret).
- **Resend (email transacional)** — entrega dos emails do Supabase Auth (convite, reset de senha)
  via **Custom SMTP** (`smtp.resend.com:465`, user `resend`, pass = API key do Resend). Config só no
  dashboard Supabase (Auth → SMTP Settings), **não há código** — `inviteUserByEmail`/`resetPasswordForEmail`
  seguem iguais, só a rota de entrega mudou. Domínio `krenke.com.br` verificado no Resend (SPF/DKIM).
  Rate limit de email subiu 2/1h → 30. **Pendente:** trocar sender pra `no-reply@krenke.com.br` e
  traduzir/branding os templates (Auth → Emails → Templates, ainda em inglês default do Supabase).
- **n8n** — `n8n.krenke.com.br` (webhooks legados; leads migraram pra Goalfy direto).
- **PowerBI** — dashboards embedados em `/relatorio` e `/marketing`.
- **Chatwoot** — `chat.krenke.com.br` (widget de chat).
- **GTM / Vercel Analytics / Speed Insights** — analytics. UTMs capturados em `lib/utm-tracker.ts`.

## Env vars

Frontend (`VITE_*`, embarcado no bundle): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`VITE_TURNSTILE_SITE_KEY`, `VITE_R2_ACCOUNT_ID`. Serverless (secreto): `SUPABASE_SERVICE_ROLE_KEY`,
`TURNSTILE_SECRET_KEY`, `GOALFY_TOKEN`, credenciais R2. `.env`/`.env.local` são gitignored.

## Segurança

- Headers em `vercel.json`: HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy.
- **CSP enforcada** (2026-08-05, era `Content-Security-Policy-Report-Only`): allowlist já
  inclui `challenges.cloudflare.com`, Supabase, GTM, PowerBI, n8n, Chatwoot, unpkg. Sem endpoint
  `report-to`/`report-uri` configurado — se algo quebrar (script/iframe bloqueado), checar console
  do navegador por página violada e ajustar allowlist em `vercel.json`.
- `X-XSS-Protection: 1; mode=block` adicionado (2026-08-05) — header legado, mas recomendado
  por auditoria de pentest.
- `Server: Vercel` exposto no header de resposta — não corrigível (Vercel não permite suprimir/
  ofuscar, é setado pela plataforma antes do `vercel.json` entrar em jogo).
- Auditoria completa de segurança/UX: **`fable.md`** (itens: R2 endpoints sem auth, sinks
  `dangerouslySetInnerHTML`, RLS a confirmar, `SecurityGuard` hostil). Consultar antes de mexer em segurança.

## Convenções

- Referência de arquivo em texto: markdown `[arquivo.tsx:linha](caminho#Llinha)`, não backticks.
- Turnstile nos forms: `onSuccess`→token, `onExpire`→reset. Token verificado server-side.
- Ações admin sensíveis (criar/deletar/convidar usuário) → sempre via `api/*` com service role, nunca client-side.
- Commits: Conventional Commits, mensagens em pt-BR.

## Estado / gotchas atuais

- **Margem + forma de pagamento na calculadora** (2026-08-04): `reseller-area/components/ProductCalculator.tsx`
  tinha bug — campo "Margem" calculava markup sobre custo (`preço × (1+margem/100)`) em vez de margem sobre
  o preço de venda. Corrigido pra `preço = custo / (1 - margem/100)` (`MAX_MARGIN = 90` trava o input pra
  fórmula não divergir). Também entraram 2 botões de forma de pagamento (`paymentTerm`): **À Vista** (5% de
  desconto sobre o total bruto, calculado antes/sem incidir sobre o IPI — IPI continua cheio pros dois) e
  **Entrada + 28 Dias** (valor cheio + IPI, comportamento antigo, é o default). Refletido no resumo, no PDF
  e persistido em `orcamento_revendas.payment_term` (nova coluna, migration `sql/orcamento_revendas_payment_term.sql`).
  ⚠️ Migration não foi aplicada pelo Claude — mesmo motivo do gotcha abaixo (MCP Supabase desta sessão aponta
  pra outro projeto, KinderCRM). Rodar manualmente no projeto certo (`rkimlgpwshntyzaoqxpb`).
- **Pasta `reseller-area/`** (2026-08-03): tudo que é exclusivo da área do revendedor (`pages/ResellerArea.tsx`,
  `components/ProductCalculator.tsx`) foi movido pra `reseller-area/pages/` e `reseller-area/components/`
  — preparo pra um dia virar app separado (+ app mobile React Native). Import em `App.tsx` aponta pra lá.
  Ficou de fora (compartilhado com o resto do site, não dá pra isolar sem duplicar): `lib/r2-upload.ts`
  (usado também por `JobApplicationForm.tsx`), `lib/supabase.ts`, `context/AuthContext.tsx`, tipos em
  `types.ts` (`ResellerFolder`/`ResellerFile`/`ResellerQuote`/`CalculatorProduct`), `components/QuoteReportView.tsx`
  (visão do **admin** sobre os orçamentos, não faz parte da experiência do revendedor) e os endpoints
  `api/r2-sync.js`/`api/upload-to-r2.js`/`api/r2-ops.js` (Vercel só roteia serverless functions que estão
  direto em `api/` na raiz — não dá pra mover pra dentro de `reseller-area/` sem quebrar o deploy).
- **Revendedor Associado na calculadora** (2026-08-03): `reseller-area/components/ProductCalculator.tsx` tem campo
  "Revendedor Associado" (dropdown com pesquisa, `associated_resellers`). Cadastro de nova revenda
  (nome manual, texto livre — sem criar usuário) restrito a allowlist fixa hardcoded no componente
  (`ASSOCIATED_RESELLER_MANAGERS`) + `super`: `ff315d16-e719-485e-8d2f-20df219666c5`,
  `1757670c-5ab0-4642-82b3-9acdbfa14701`, `40bfce8e-fe27-44e2-bda3-cf6273fc6fea`,
  `d19952b5-151c-4943-bf74-1a07b199ba75`. Mesmo padrão de allowlist do `/relatorio`. **Pendente:**
  associar login de revendedor à revenda da lista (por ora é só nome solto, snapshot em
  `orcamento_revendas.associated_reseller_name`). ⚠️ Migration `sql/associated_resellers.sql` não
  foi aplicada pelo Claude — MCP Supabase conectado nesta sessão aponta pra outro projeto
  (KinderCRM, não Krenke Brinquedos). Rodar manualmente no projeto certo (`rkimlgpwshntyzaoqxpb`).
- **Relatório de orçamentos** (2026-07-27): `components/QuoteReportView.tsx` em `/pgadmin/relatorio-orcamentos`
  (nav só pra `super`, render também gated por `role === 'super'`). Lê `orcamento_revendas` client-side
  (filtro de período server-side via `.gte('created_at')`, teto 5000 linhas), resolve autor por
  `reseller_name` (snapshot) → `profiles.full_name/email` → id abreviado. KPIs + ranking por revendedor +
  barras por mês + tabela + CSV (`;` e BOM pro Excel pt-BR). ⚠️ Não confundir com a aba **Leads**
  ("Orçamentos Recebidos" = form público `/orcamento` → tabela `leads`).
- **Resend SMTP ativo** (2026-07-23): emails do Auth entregam via Resend (ver Integrações). Testado
  ponta-a-ponta: reset de senha → Supabase → Resend (`POST /emails` 200) → inbox. Sender atual
  `gabriel@krenke.com.br` (trocar pra `no-reply@`); templates ainda default em inglês (traduzir depois).
- **Forgot-password no login** (2026-07-23): `pages/Auth.tsx` tem modo `forgot` (link "Esqueci minha
  senha" → email + Turnstile → `resetPasswordForEmail`, `redirectTo: /revendedor`). Confirmação genérica
  (não vaza existência de conta). ⚠️ recovery cai em `/revendedor` (form de troca de senha em
  `reseller-area/pages/ResellerArea.tsx`) — só `super`/`reseller` acessam; `hr`/`mkt` não teriam onde trocar. OK hoje (só
  resellers usam). Se abrir reset pra outros papéis, criar página de recovery universal.
- **Turnstile REATIVADO no login** (2026-07-18): gate + widget + `options:{captchaToken}` restaurados
  em `pages/Auth.tsx` (o erro "Troubleshoot" sumiu — widget renderiza normal nos forms públicos).
  **Falta (dashboard):** religar captcha no Supabase (Auth → Attack Protection → Turnstile, secret =
  `TURNSTILE_SECRET_KEY`) — sem isso o token é enviado mas não verificado no auth.
- **FK `profiles`→`auth.users`** mudada pra `ON DELETE CASCADE` (migration `profiles_fk_cascade_on_user_delete`,
  2026-07-17) — antes era `NO ACTION` e bloqueava deletar usuário ("Database error deleting user").
- Não há `src/`: `App.tsx`, `index.tsx`, `pages/`, `components/`, `lib/`, `context/`, `api/` na raiz.
- `reseller-area/` (raiz, com `pages/` e `components/` próprios) = tudo exclusivo da área do revendedor,
  isolado de propósito pra facilitar extração futura pra app separado. Ver gotcha acima.
- `lib/site-packages/` = lixo de pip commitado (ver `fable.md` R1); ignorar.
