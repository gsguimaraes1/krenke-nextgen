# 📋 Product Requirements Document (PRD)
## Krenke Brinquedos — Site Institucional & Painel Administrativo
**Versão:** 2026.1  
**Data:** Março 2026  
**Status:** Produção  
**Stack:** Vite + React 19 + TypeScript + Supabase + Framer Motion  

---

## 1. Visão Geral do Produto

### 1.1 Proposta de Valor
O **Krenke NextGen** é o site institucional e sistema de gestão da **Krenke Brinquedos**, a maior e mais premiada fábrica de playgrounds do Brasil, fundada em 1987. A plataforma serve como principal canal de vendas, marketing de conteúdo e operações B2B da empresa.

### 1.2 Objetivos de Negócio
- Gerar leads qualificados via formulário de orçamento
- Apresentar o catálogo completo de produtos com filtros avançados
- Prover acesso à área de revendedor com tabela de preços e composições
- Gerir conteúdo editorial (Blog) para autoridade de mercado
- Centralizar o gerenciamento de dados em painel administrativo seguro
- Rastrear conversões com integração GTM / Google Analytics

### 1.3 Público-Alvo
| Segmento | Perfil |
|---|---|
| **Clientes B2B** | Hotéis, condomínios, escolas privadas, prefeituras |
| **Revendedores** | Distribuidores com acesso a tabela de preços exclusiva |
| **Administradores** | Equipe interna (super admin e acesso restrito) |

---

## 2. Arquitetura & Stack Tecnológica

### 2.1 Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| **React** | 19.2.0 | Framework de UI |
| **TypeScript** | ~5.8.2 | Tipagem estática |
| **Vite** | 6.x | Bundler e dev server (porta 3000) |
| **Framer Motion** | 11.x | Animações e microinterações |
| **React Router DOM** | 7.x | Roteamento SPA |
| **Lucide React** | 0.554.0 | Ícones |
| **React Select** | 5.x | Select inteligente (busca de cidades) |
| **React Phone Number Input** | 3.x | Input de telefone com validação |
| **React Quill New** | 3.x | Editor de rich text (Blog) |

### 2.2 Backend / BaaS
| Serviço | Uso |
|---|---|
| **Supabase** | Banco de dados PostgreSQL, Auth, Storage |
| **IBGE API** | Listagem de municípios brasileiros para o formulário |
| **n8n Webhook** | Automação de notificação de novos leads |
| **Google Sheets (CSV)** | Fonte de dados da tabela de preços do revendedor |

### 2.3 Banco de Dados (Supabase)
#### Tabelas Identificadas
| Tabela | Campos Principais | Descrição |
|---|---|---|
| `products` | id, name, slug, category, image, images[], description, specs | Catálogo de produtos |
| `leads` | id, name, email, phone, city, segment, message, products[] | Formulários de orçamento |
| `posts` | id, title, slug, content, excerpt, cover_image, author, published | Blog |
| `profiles` | id, email, role (super/restricted), full_name, avatar_url | Usuários do admin |
| `app_scripts` | id, title, content, placement (head/body), is_active | Scripts de terceiros (GTM, Pixel) |
| `site_settings` | key, value | Configurações dinâmicas (webhook URLs, logos) |

#### Storage Buckets
| Bucket | Uso |
|---|---|
| `public/avatars/` | Fotos de perfil dos administradores |
| `products/` | Imagens dos produtos por pasta (ID do produto) |

---

## 3. Rotas da Aplicação

### 3.1 Rotas Públicas (com Layout Principal)
| Rota | Componente | Descrição |
|---|---|---|
| `/` | `Home.tsx` | Página principal |
| `/empresa` | `About.tsx` | Sobre a empresa |
| `/produtos` | `Products.tsx` | Catálogo de produtos |
| `/blog` | `Blog.tsx` | Listagem de artigos |
| `/blog/:slug` | `BlogPost.tsx` | Artigo individual |
| `/projetos` | `Projects.tsx` | Portfolio de projetos |
| `/downloads` | `Downloads.tsx` | Materiais para download |
| `/orcamento` | `Quote.tsx` | Formulário de orçamento |
| `/politica-de-privacidade` | `Privacy.tsx` | Política de privacidade |
| `/termos-de-uso` | `Terms.tsx` | Termos de uso |

### 3.2 Rotas Autenticadas
| Rota | Componente | Proteção |
|---|---|---|
| `/login` | `Auth.tsx` | Pública (redireciona se logado) |
| `/pgadmin/*` | `Admin.tsx` | `ProtectedRoute` + verificação de sessão Supabase |

### 3.3 Sub-rotas do Painel Admin
| Sub-rota | View | Acesso |
|---|---|---|
| `/pgadmin` | Dashboard | Todos |
| `/pgadmin/produtos` | Gestão de Produtos | Todos |
| `/pgadmin/blog` | Gestão do Blog | Todos |
| `/pgadmin/leads` | Gestão de Orçamentos | Todos |
| `/pgadmin/usuarios` | Gestão de Usuários | Super Admin |
| `/pgadmin/scripts` | Scripts & Tags | Super Admin |
| `/pgadmin/configuracoes` | Configurações | Super Admin |
| `/pgadmin/perfil` | Perfil do Usuário | Todos |

---

## 4. Funcionalidades Detalhadas

### 4.1 Página Inicial (Home)

#### Seções
1. **HeroSection** — Vídeo de background (`videokrenke.mp4`), headline animada (Framer Motion), CTAs para "Explorar Produtos" e "Fazer Orçamento"
2. **Features** — 3 cards: "Desde 1987", "Segurança 360°", "Alta Tecnologia"
3. **CategoryPreview** — Grid de 4 categorias com imagens (Playgrounds Completos, Brinquedos Avulsos, Linha Pet, Jardim e Mobília)
4. **StatsSection** — Seção "Nossa Essência" com barras de progresso animadas e imagem da fábrica
5. **BlogPreview** — Últimos 3 artigos publicados via Supabase (oculto se não há posts)
6. **Differentials** — 6 cards de diferenciais (Foco no Ser Humano, Sob Medida, Logística, etc.)
7. **ComparativeTable** — Tabela comparativa Krenke vs. Mercado Comum com 10 critérios técnicos
8. **ImageCarousel** — Carrossel de imagens (componente reutilizável)

#### GTM Data Layer
- Eventos `pageview` disparados via `window.dataLayer` em cada troca de rota
- Classes GTM em botões críticos: `gtm-home-hero-button-products`, `gtm-home-hero-button-quote`, `gtm-home-category-button-full-quote`

---

### 4.2 Catálogo de Produtos (`/produtos`)

#### Categorias Disponíveis
- Todos
- Playgrounds Completos
- Little Play
- Brinquedos Avulsos
- Linha Pet
- Mobiliário Urbano e Jardim
- LINHA TEMÁTICA

#### Funcionalidades
- **Fonte de dados dupla:** Supabase (primário) com fallback para `products.json` local
- **Descoberta automática de imagens:** Vite Glob Import (`import.meta.glob`) mapeia assets locais pelo nome normalizado do produto
- **Filtros:** Sidebar por categoria + busca por nome/código (URL params: `?categoria=`)
- **Modal de produto:** Galeria com thumbnails, especificações ricas (HTML via `dangerouslySetInnerHTML`), botão de orçamento redireciona para `/orcamento?produto={id}`
- **URL State:** Produto selecionado via `?produto={id}` para compartilhamento de links diretos

---

### 4.3 Formulário de Orçamento (`/orcamento`)

#### Campos do Formulário
| Campo | Tipo | Validação |
|---|---|---|
| Nome completo | Text | Mínimo 3 caracteres |
| Telefone/WhatsApp | PhoneInput internac. | `isValidPhoneNumber()` |
| Cidade | React Select (IBGE) | Obrigatório |
| Segmento | Select | Hotel, Condomínio, Escola Privada, Outros |
| E-mail | Email | Formato válido |
| Produtos desejados | Multi-select grid | Mínimo 1 produto |
| Detalhes do projeto | Textarea | Opcional |
| **Honeypot** | Hidden input | Proteção anti-bot |

#### Fluxo de Submissão
1. Validação client-side
2. Checagem do campo honeypot (bot detection)
3. Insert na tabela `leads` do Supabase
4. Disparo para webhook n8n (URL configurada em `site_settings`)
   - Modo `test`: `webhook_test_url`
   - Modo `prod`: `webhook_prod_url`
5. Reset do formulário + mensagem de sucesso por 5 segundos

---

### 4.4 Blog

#### Funcionalidades
- Listagem paginada de posts (`published = true`) ordenados por data
- Página individual via `/blog/:slug`
- Preview na Home com os 3 posts mais recentes
- Campos: título, slug, conteúdo (rich text), excerpt, cover_image, autor, data

---

### 4.5 Área do Revendedor (`ResellerArea`)

> ⚠️ **Nota:** Esta página não possui rota registrada em `App.tsx` no momento. Existe como componente mas não está acessível publicamente via link.

#### Funcionalidades
- Busca e filtragem de produtos por nome/código e categoria
- Dados carregados via **Google Sheets publicado como CSV**
- Exibe preço sugerido de revenda composto (por complexidade + peso)
- Modal de detalhe com tabela de componentes (código Focco, nome, quantidade, peso)
- Tabela vigente: Janeiro 2026

---

### 4.6 Painel Administrativo (`/pgadmin`)

#### Dashboard
- KPIs: Total de Produtos, Novos Orçamentos, Artigos no Blog, Usuários
- Feed: Últimos orçamentos e artigos recentes

#### Gestão de Produtos
- CRUD completo (criar, editar, excluir)
- Upload de imagem principal + galeria
- Scanner automático de imagens no Storage Supabase por pasta (ID do produto)
- Editor de especificações técnicas (`ProductSpecsManager`)
- Busca por nome, ID ou categoria

#### Gestão do Blog
- CRUD de posts com RichTextEditor (Quill)
- Controle de publicação (rascunho / publicado)
- Upload de cover image
- Geração automática de slug

#### Gestão de Leads (Orçamentos)
- Listagem completa de leads com data, nome, produtos selecionados
- Detalhes expandidos: email, telefone, segmento, cidade, mensagem

#### Gestão de Usuários
- Listagem de todos os perfis cadastrados
- Alteração de nível de acesso: `super` | `restricted`
- Avatar + data de cadastro

#### Scripts & Tags (`/pgadmin/scripts`)
- CRUD de scripts de terceiros (GTM, Facebook Pixel, etc.)
- Posicionamento: `head` ou `body`
- Toggle ativo/inativo
- Editor de código com destaque (dark mode textarea)

#### Configurações do Sistema
- URLs de webhook (teste e produção)
- Toggle entre modo `test` e `prod`
- Upsert de todas as configurações via `site_settings`

#### Perfil do Usuário
- Edição de nome completo
- Upload de avatar (Supabase Storage `public/avatars/`)
- Email exibido como read-only

---

## 5. Sistema de Design

### 5.1 Paleta de Cores
| Token | Hex | Uso |
|---|---|---|
| `krenke-purple` | `#312783` | Cor primária da marca |
| `vibrant-orange` | `#FF9F0A` / `#FE6B01` | CTAs, destaques, ações |
| `vibrant-green` | `#2ECC71` | Sucesso, confirmações |
| `vibrant-cyan` | `#00D1FF` | Acentos secundários |
| `vibrant-purple` | `#4032B2` | Variante mais viva do roxo |

### 5.2 Tipografia
- **Família:** Sans-serif system font (via Tailwind defaults)
- **Estilo:** Black (900), uppercase com `tracking-tighter` para headings impactantes
- **Hierarquia:** h1 = 8xl, h2 = 6xl-7xl, h3 = 2xl-4xl

### 5.3 Componentes de UI
| Componente | Arquivo | Descrição |
|---|---|---|
| `Layout` | `components/Layout.tsx` | Header, Footer, navegação principal |
| `AdminLayout` | `components/AdminLayout.tsx` | Sidebar + header do admin |
| `QuoteForm` | `components/QuoteForm.tsx` | Formulário de orçamento |
| `ImageCarousel` | `components/ImageCarousel.tsx` | Carrossel de imagens |
| `RichTextEditor` | `components/RichTextEditor.tsx` | Editor Quill para blog |
| `ProductSpecsManager` | `components/ProductSpecsManager.tsx` | Editor de specs de produto |
| `Preloader` | `components/Preloader.tsx` | Tela de carregamento inicial |
| `IntroScreen` | `components/IntroScreen.tsx` | Animação de intro |
| `CookieConsent` | `components/CookieConsent.tsx` | Banner LGPD |
| `ProtectedRoute` | `components/ProtectedRoute.tsx` | Guard de autenticação |
| `ScriptInjector` | `components/ScriptInjector.tsx` | Injeta scripts dinâmicos do Supabase |
| `ShowcaseCard` | `components/ui/ShowcaseCard.tsx` | Card animado de categoria |

---

## 6. Autenticação & Autorização

### 6.1 Fluxo de Auth
- **Provider:** Supabase Auth (email + senha)
- **Context:** `AuthContext` expõe `user`, `profile`, `signIn`, `signOut`, `refreshProfile`
- **Guard:** `ProtectedRoute` verifica sessão ativa; redireciona para `/login` se não autenticado
- **Double-check:** Admin verifica sessão diretamente em `supabase.auth.getSession()` no mount

### 6.2 Níveis de Acesso
| Role | Acesso |
|---|---|
| `super` | Acesso total ao admin, incluindo usuários, scripts e configurações |
| `restricted` | Acesso limitado (aguardando autorização — lógica de UI implementada) |

---

## 7. Integrações Externas

| Integração | Tipo | Uso |
|---|---|---|
| **Google Tag Manager** | Script injetado | Rastreamento de eventos e conversões |
| **n8n** | Webhook HTTP POST | Notificação de novos orçamentos |
| **IBGE API** | REST público | `https://servicodados.ibge.gov.br/api/v1/localidades/municipios` |
| **Google Sheets** | CSV publicado | Tabela de preços do revendedor |
| **Supabase Storage** | CDN | Imagens de produtos e avatares |

---

## 8. Data Types (TypeScript)

```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  description: string;
  images?: string[];
  specs?: string; // HTML string
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  segment: string;
  message: string;
  products: string[]; // Array de nomes de produtos
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  author: string;
  published: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  role: 'super' | 'restricted';
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface AppScript {
  id: string;
  title: string;
  content: string;
  placement: 'head' | 'body';
  is_active: boolean;
  created_at?: string;
}
```

---

## 9. Configurações do Ambiente

### 9.1 Variáveis de Ambiente (`.env`)
| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon key) do Supabase |

### 9.2 Configuração de Build
| Parâmetro | Valor |
|---|---|
| Porta de desenvolvimento | `3000` |
| Bundler | Vite 6 |
| Target | ESNext |
| Módulos | ESM (`"type": "module"`) |

---

## 10. Funcionalidades Futuras / Pendências Identificadas

| Item | Prioridade | Contexto |
|---|---|---|
| Registrar rota para `ResellerArea` | Alta | Componente existe mas não está roteado |
| Implementar lógica de acesso `restricted` no admin | Média | UI exibe "Aguardando Autorização" mas sem bloqueio de views |
| Adicionar skeleton loaders em Products e Blog | Baixa | Atualmente exibe texto "Carregando..." |
| Paginação do Blog | Média | Atualmente carrega todos os posts |
| Checklist de downloads | Baixa | `Downloads.tsx` existe mas não foi auditada |
| Audit de acessibilidade (WCAG) | Média | Imagens com alt genérico em alguns casos |

---

## 11. Pontos de Rastreamento GTM (Classes CSS)

| Classe | Local | Evento Esperado |
|---|---|---|
| `gtm-home-hero-button-products` | Hero CTA | Click → Produtos |
| `gtm-home-hero-button-quote` | Hero CTA | Click → Orçamento |
| `gtm-home-feature-desde-1987` | Card Feature | Engajamento |
| `gtm-home-feature-abnt` | Card Feature | Engajamento |
| `gtm-home-feature-rotomoldagem` | Card Feature | Engajamento |
| `gtm-home-category-button-full-quote` | Category CTA | Click → Orçamento |

---

*Documento gerado a partir de análise completa da codebase em Março/2026.*
