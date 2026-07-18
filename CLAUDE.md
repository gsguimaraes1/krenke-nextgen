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
| `/revendedor` | `super`, `reseller` (`pages/ResellerArea.tsx`) |
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
`reseller_folders`/`reseller_files` (área revendedor), `job_openings`/`job_applications` (RH).

- **Ferramentas Supabase disponíveis via MCP** (`Supabase- Krenke Brinquedos`): `execute_sql`,
  `apply_migration`, `list_tables`, `get_advisors`, `get_logs` etc. Use pra inspecionar/alterar o banco.

## Integrações

- **Goalfy CRM** — leads viram cards direto na Goalfy (`submit-lead.js`); board "ENTRADA DE LEAD",
  etiqueta "Site Novo Krenke". IDs de campos/model hardcoded no arquivo. Env: `GOALFY_TOKEN`.
- **Cloudflare Turnstile** — captcha. Mesma site key (`VITE_TURNSTILE_SITE_KEY`) em login + forms
  públicos (Quote, JobApplication, WhatsApp, Catálogo). Verificação server-side em `verifyTurnstile`
  (`TURNSTILE_SECRET_KEY`). Supabase Auth usava Turnstile como provider de captcha (mesma secret).
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
- **CSP em `Content-Security-Policy-Report-Only`** (ainda não bloqueia — só reporta). Allowlist já
  inclui `challenges.cloudflare.com`, Supabase, GTM, PowerBI, n8n, Chatwoot, unpkg.
- Auditoria completa de segurança/UX: **`fable.md`** (itens: R2 endpoints sem auth, sinks
  `dangerouslySetInnerHTML`, RLS a confirmar, `SecurityGuard` hostil). Consultar antes de mexer em segurança.

## Convenções

- Referência de arquivo em texto: markdown `[arquivo.tsx:linha](caminho#Llinha)`, não backticks.
- Turnstile nos forms: `onSuccess`→token, `onExpire`→reset. Token verificado server-side.
- Ações admin sensíveis (criar/deletar/convidar usuário) → sempre via `api/*` com service role, nunca client-side.
- Commits: Conventional Commits, mensagens em pt-BR.

## Estado / gotchas atuais

- **[TEMP] Turnstile DESATIVADO no login** (`pages/Auth.tsx`, commit `c752443`, 2026-07-17):
  gate + widget comentados com marcador `TEMP: Turnstile`; captcha do Supabase também desligado no
  dashboard. Motivo: widget em estado de erro "Troubleshoot" em produção (site key/widget a diagnosticar —
  clicar em "Troubleshoot" dá o código: `110100`=key inválida, `110200`=domínio). Reativar: descomentar
  os dois blocos + restaurar `options:{captchaToken}` no `signInWithPassword`, corrigir a key, religar captcha no Supabase.
- **FK `profiles`→`auth.users`** mudada pra `ON DELETE CASCADE` (migration `profiles_fk_cascade_on_user_delete`,
  2026-07-17) — antes era `NO ACTION` e bloqueava deletar usuário ("Database error deleting user").
- Não há `src/`: `App.tsx`, `index.tsx`, `pages/`, `components/`, `lib/`, `context/`, `api/` na raiz.
- `lib/site-packages/` = lixo de pip commitado (ver `fable.md` R1); ignorar.
