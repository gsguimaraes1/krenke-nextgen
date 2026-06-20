# Handoff — Site Krenke · Sessão 2025-06

## Status Geral
Implementação de "Trabalhe Conosco" **100% concluída**. Nenhuma tarefa pendente. Pronto para teste e deploy.

---

## O que foi construído nesta sessão

### Contexto
Feature de recrutamento completa para o site Krenke Brinquedos. HR gerencia vagas via admin panel sem envolvimento de dev.

---

## Banco de Dados (Supabase — projeto Krenke)

### Tabelas criadas via MCP migration

**`job_openings`**
```sql
id          uuid PK default gen_random_uuid()
title       text NOT NULL
type        text NOT NULL  -- 'CLT' | 'PJ' | 'Reseller' | 'Banco de Talentos'
department  text
location    text
description text
requirements text
is_active   boolean default true
created_at  timestamptz default now()
updated_at  timestamptz default now()
```
RLS: público lê somente `is_active = true`; autenticado faz tudo.

**`job_applications`**
```sql
id               uuid PK default gen_random_uuid()
opening_id       uuid FK → job_openings(id) nullable
name             text NOT NULL
email            text NOT NULL
phone            text NOT NULL
city             text NOT NULL
state            text NOT NULL
application_type text NOT NULL
message          text
cv_url           text   -- URL pública no Cloudflare R2
utm_source       text
utm_medium       text
utm_campaign     text
utm_term         text
utm_content      text
utm_id           text
submitted_at     timestamptz default now()
```
RLS: público pode INSERT; autenticado pode SELECT.

---

## Arquivos Criados

### `components/JobApplicationForm.tsx`
Formulário completo de candidatura.
- Campos: nome, e-mail, telefone (PhoneInput BR), estado (27 UFs), cidade (IBGE API dinâmica), tipo de vaga, vaga de interesse (dropdown das vagas ativas), mensagem, CV PDF (upload R2, máx 5MB)
- Honeypot anti-bot: campo oculto `b_website_url`
- UTMs: captura via `lib/utm-tracker.ts` → `getStoredUTMs()`
- CV upload: `lib/r2-upload.ts` → `uploadToR2(file, 'curriculos')`
- Submit flow: validate → R2 upload → `supabase.from('job_applications').insert()` → n8n webhook (fire-and-forget) → navigate('/obrigado-curriculo')
- n8n endpoint: `POST https://n8n.krenke.com.br/webhook/trabalhe-conosco`
- Props: `{ openings: JobOpening[], preselectedOpening?: JobOpening | null }`

### `pages/Careers.tsx`
Página pública `/trabalhe-conosco`.
- Seção 1: Hero — fundo purple `#312783`, gradient orbs, título "Trabalhe Conosco", CTA scroll-to-form
- Seção 2: "Por que a Krenke?" — 4 cards (Propósito Real, Inovação, Crescimento, Time Unido)
- Seção 3: Vagas em Aberto — busca `job_openings` onde `is_active = true`, agrupa por tipo, botão "Candidatar-se" → scroll + preselect
- Seção 4: Formulário — `<JobApplicationForm>`, `ref={formRef}` para scroll target
- Estado vazio: exibe prompt de candidatura espontânea quando não há vagas ativas
- Framer Motion animations com `whileInView` (padrão do site)
- SEO: `react-helmet-async` com title/description/canonical

### `pages/ObrigadoCurriculo.tsx`
Página de confirmação pós-candidatura `/obrigado-curriculo` (fora do Layout — sem navbar/footer).
- Visual idêntico ao `Obrigado.tsx`: fundo purple, partículas flutuantes, glassmorphism card, gradient strip no topo
- Copy: "RECEBEMOS!" + "Sua candidatura foi enviada com sucesso." + texto de prazo RH
- 2 CTAs: "Ver Outras Vagas" (→ /trabalhe-conosco) e "Voltar ao Site" (→ /)
- Sem redirect WhatsApp

---

## Arquivos Modificados

### `types.ts`
Adicionadas duas interfaces no final do arquivo:
```typescript
export interface JobOpening {
  id: string;
  title: string;
  type: 'CLT' | 'PJ' | 'Reseller' | 'Banco de Talentos';
  department: string | null;
  location: string | null;
  description: string | null;
  requirements: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  opening_id: string | null;
  name: string; email: string; phone: string;
  city: string; state: string;
  application_type: string;
  message: string | null;
  cv_url: string | null;
  utm_source?: string; utm_medium?: string; utm_campaign?: string;
  utm_term?: string; utm_content?: string; utm_id?: string;
  submitted_at: string;
}
```

### `App.tsx`
Adicionados lazy imports e rotas:
```typescript
const CareersPage = React.lazy(() => import('./pages/Careers'));
const ObrigadoCurriculoPage = React.lazy(() => import('./pages/ObrigadoCurriculo'));
```
- `/trabalhe-conosco` → dentro do wrapper `<Layout>` (tem navbar/footer)
- `/obrigado-curriculo` → fora do wrapper (sem navbar/footer)

### `components/AdminLayout.tsx`
- Adicionado `Briefcase` ao import do lucide-react
- Adicionados 2 itens ao `menuItems[]`:
  ```typescript
  { icon: Briefcase, label: 'Vagas', path: '/pgadmin/vagas', testId: 'nav-vagas' },
  { icon: Briefcase, label: 'Candidaturas', path: '/pgadmin/candidaturas', testId: 'nav-candidaturas' },
  ```

### `pages/Admin.tsx`
Adicionadas views completas para gestão de RH:
- **`/pgadmin/vagas`** — CRUD de vagas: formulário create/edit (title, type, department, location, description, requirements, is_active), lista com toggle ativo/inativo e delete
- **`/pgadmin/candidaturas`** — View read-only: lista de candidaturas com link para CV (R2), badge da vaga, badges de cidade/estado/tipo
- Functions adicionadas: `fetchJobOpenings`, `fetchJobApplications`, `saveJobOpening`, `deleteJobOpening`, `toggleJobOpening`
- State vars adicionadas: `jobOpenings`, `jobApplications`, `jobOpeningForm`, `editingOpening`
- Routing: Admin usa `location.pathname` para `activeView` — adicionados cases `vagas` e `candidaturas`

### `components/Layout.tsx`
Adicionado link no rodapé (barra legal):
```tsx
<Link id="footer-link-trabalhe-conosco" to="/trabalhe-conosco" className="hover:text-vibrant-orange transition-colors px-2 py-1">
  Trabalhe Conosco
</Link>
```

---

## Padrões do Projeto (para referência futura)

| Padrão | Onde encontrar |
|--------|---------------|
| Form fields + IBGE | `components/QuoteForm.tsx` |
| UTM capture | `lib/utm-tracker.ts` → `getStoredUTMs()` |
| R2 upload | `lib/r2-upload.ts` → `uploadToR2(file, folder)` |
| Supabase client | `lib/supabase.ts` |
| Honeypot | campo `b_website_url` oculto |
| Thank-you page | `pages/Obrigado.tsx` (estrutura visual) |
| Admin routing | URL-path-based `activeView` em `pages/Admin.tsx` |
| Lazy loading | `React.lazy()` em `App.tsx` |
| Animations | Framer Motion `whileInView` com `viewport: { once: true }` |
| SEO | `react-helmet-async` → `<Helmet>` |

---

## Stack Técnica

- React 19 + TypeScript + Vite
- Supabase (PostgreSQL + RLS)
- Cloudflare R2 (storage de CVs)
- n8n (webhook notifications)
- Framer Motion
- react-phone-number-input
- IBGE API (cidades dinâmicas)
- react-helmet-async
- **Sem `src/`** — todos os arquivos ficam em `e:\PROJETOS\Site_Krenke\` (raiz do projeto)

---

## Checklist de Teste (pendente validação manual)

- [ ] `/trabalhe-conosco` carrega com hero, values, vagas (ou estado vazio)
- [ ] Criar vaga no admin `/pgadmin/vagas` → aparece na página pública
- [ ] Clicar "Candidatar-se" → scroll para formulário + vaga pré-selecionada
- [ ] Submeter candidatura com CV PDF → linha em `job_applications` no Supabase + `cv_url` preenchida
- [ ] n8n recebe payload em `/webhook/trabalhe-conosco`
- [ ] Redirect para `/obrigado-curriculo` funciona
- [ ] Desativar vaga no admin → some da página pública
- [ ] Honeypot preenchido → submit bloqueado silenciosamente
- [ ] Admin `/pgadmin/candidaturas` lista candidaturas com link para CV

---

## Próximos Passos Opcionais (não solicitados)

1. **Configurar n8n webhook** em `https://n8n.krenke.com.br/webhook/trabalhe-conosco` para notificar RH via email/WhatsApp
2. **Adicionar "Trabalhe Conosco" ao menu principal** (atualmente só no footer)
3. **Rich text editor** para campo `description` das vagas no admin (já existe `RichTextEditor.tsx` no projeto)
4. **Deploy** para testar em produção

---

## Observações

- Erros TypeScript pré-existentes em `Admin.tsx` (linhas 1451, 1526 aprox) não foram introduzidos nesta sessão — são anteriores
- `AnimatePresence` importado sem uso em `AdminLayout.tsx` — pré-existente, não tocado
- `npx tsc --noEmit` sem erros nos arquivos novos/modificados desta sessão
