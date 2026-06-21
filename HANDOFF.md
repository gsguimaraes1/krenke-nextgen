# HANDOFF — Melhorias de Performance e SEO

Data: 21/06/2026  
Branch: main  
Último commit: b73c3b7

---

## Contexto

Site: https://site.krenke.com.br  
Stack: Vite + React + TypeScript + Tailwind v4 + Supabase  
Hospedagem: Hostgator (DNS), Vercel ou servidor próprio  
Auth: Supabase + Cloudflare Turnstile CAPTCHA (já implementado)

### Resultado PageSpeed atual (mobile)
| Métrica | Valor | Status |
|---|---|---|
| LCP | 5,3s | 🔴 Ruim |
| INP | 581ms | 🔴 Ruim |
| CLS | 0,02 | 🟢 Bom |
| FCP | 3s | 🟡 Médio |
| TTFB | 1,7s | 🟡 Médio |

Desktop passa em tudo. Mobile reprovado nos Core Web Vitals.

---

## Tarefas por prioridade

### 🔴 CRÍTICO

#### 1. Migrar DNS da Krenke para Cloudflare
- DNS atual na Hostgator — sem CDN, sem cache de borda
- Migrar `site.krenke.com.br` para Cloudflare DNS
- Ativa CDN global automaticamente → TTFB cai ~50%, LCP melhora
- **Não precisa mexer em código** — só configuração no painel
- Passos: Cloudflare → Add site → krenke.com.br → copiar nameservers → alterar na Hostgator
- Após migração: ativar **Bot Fight Mode** e **Cache Rules** para assets estáticos

#### 2. Remover/adiar Google Translate
- Google Translate carrega script síncrono no `<head>` — bloqueia render no mobile
- **INP 581ms** tem grande parte causada por isso
- Opções:
  - a) Remover Google Translate completamente (recomendado se uso for baixo)
  - b) Carregar com `defer` + inicializar só após `load` event
  - c) Substituir por solução CSS-only ou API de tradução lazy
- Arquivo: `index.html` — remover ou adiar o script do GTM e Translate

#### 3. Preload da imagem hero (LCP)
- Adicionar no `index.html`:
  ```html
  <link rel="preload" as="image" href="/assets/hero-image.webp" fetchpriority="high" />
  ```
- Identificar qual imagem é o LCP element (inspecionar no Chrome DevTools → Performance → LCP)
- Adicionar `fetchpriority="high"` na tag `<img>` do hero no componente React

---

### 🟡 IMPORTANTE

#### 4. Converter imagens para WebP
- Site tem PNGs grandes (incluindo 45 imagens do login carousel)
- Converter tudo para WebP: `cwebp -q 80 input.png -o output.webp`
- Ou usar ferramenta online: squoosh.app (batch)
- As 45 imagens de login em `assets/login/*.png` → converter para `.webp`
- Atualizar o glob no `Auth.tsx`:
  ```ts
  const imageModules = import.meta.glob('../assets/login/*.webp', { eager: true })
  ```
- Imagens do site público: verificar componentes com `<img>` e substituir src

#### 5. Lazy loading em imagens fora do viewport
- Adicionar `loading="lazy"` em todas as `<img>` que não são hero/acima da dobra
- Verificar componentes: `pages/Home.tsx`, catálogo de produtos, galeria

#### 6. Code splitting mais agressivo
- Bundle JS atual provavelmente grande — atrasa FCP
- `vite.config.ts` já tem `manualChunks` básico
- Adicionar chunks para páginas pesadas (Admin, ResellerArea)
- Verificar com `npx vite-bundle-visualizer` qual chunk é maior

#### 7. Fonte Nunito — otimizar carregamento
- Fonte carrega do Google Fonts (request externo)
- Adicionar `font-display: swap` e `preconnect` (já tem no index.html mas verificar)
- Considerar hospedar fonte localmente via `@fontsource/nunito`

---

### 🟢 SEO

#### 8. Google Search Console
- Verificar se site está indexado: search.google.com/search-console
- Submeter sitemap se não existir
- Verificar erros de cobertura (páginas 404, redirect chains)

#### 9. Meta tags dinâmicas por página
- Atualmente todas as páginas têm o mesmo `<title>` e `<meta description>` do `index.html`
- Implementar `react-helmet-async` para meta tags dinâmicas por rota
- Priorizar: Home, páginas de produto, landing pages

#### 10. Sitemap.xml e robots.txt
- Verificar se existem: `site.krenke.com.br/sitemap.xml` e `/robots.txt`
- Se não: gerar sitemap estático ou via plugin Vite
- Bloquear rotas privadas no robots.txt (`/login`, `/pgadmin`, `/revendedor`)

---

### 🔵 SEGURANÇA (próximos passos)

#### 11. MFA / TOTP para usuários internos
- Código de enrollment já discutido mas não implementado
- Criar página `/mfa-setup` com QR code via `supabase.auth.mfa.enroll()`
- Fluxo: login → detectar se fator ausente → redirecionar para setup
- Ver detalhes na conversa anterior

#### 12. Cloudflare Email Routing
- `contato@krenke.com.br` → redirecionar para Gmail gratuitamente
- Requer DNS na Cloudflare (depende da tarefa 1)

---

## Estado atual do código

### Arquivos alterados nesta sessão
- `pages/Auth.tsx` — tela de login completamente refatorada
- `index.css` — grain removido, animações de botão adicionadas
- `index.html` — grain overlay removido
- `vite.config.ts` — Terser + obfuscação + no sourcemaps
- `package.json` — adicionado `@marsidev/react-turnstile`, `canvas-confetti`
- `.env` — adicionado `VITE_TURNSTILE_SITE_KEY`

### Configurações feitas no Supabase Dashboard
- CAPTCHA: Cloudflare Turnstile habilitado (Attack Protection)
- Chave secreta já salva no dashboard
- TOTP MFA: habilitado (Auth → Multi-Factor)

### Pendente de configuração
- Supabase → Auth → Sessions → JWT expiry (plano free não permite Time-box)
- Cloudflare Turnstile → adicionar `localhost` nos domínios permitidos para dev local

---

## Comandos úteis

```bash
# Analisar bundle
npx vite-bundle-visualizer

# Converter imagens PNG para WebP (requer cwebp instalado)
for f in assets/login/*.png; do cwebp -q 80 "$f" -o "${f%.png}.webp"; done

# TypeScript check
npx tsc --noEmit

# Build de produção
npm run build
```
