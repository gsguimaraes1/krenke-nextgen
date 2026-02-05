# Krenke NextGen 2026 - Product Requirement Document (PRD)

## 📝 Visão Geral do Projeto
O **Krenke NextGen 2026** é a reimaginação moderna e de alta performance do site institucional da **Krenke Brinquedos**, líder brasileira na fabricação de playgrounds e equipamentos de lazer desde 1987. O objetivo é fornecer uma experiência digital premium que reflita a qualidade, segurança e inovação tecnológica da marca.

---

## 🎯 Objetivo e Problema
### O Problema
O mercado de playgrounds exige confiança absoluta em segurança (normas ABNT) e especificações técnicas precisas para arquitetos e gestores de condomínios. A presença digital anterior precisava de uma atualização para suportar melhor a jornada de compra B2B e institucional, facilitando orçamentos e a gestão de conteúdo dinâmico.

### O Objetivo
- Estabelecer autoridade através de um design moderno e "premium".
- Facilitar a descoberta de produtos e categorias (Playgrounds, Linha Pet, Mobiliário).
- Otimizar a conversão através de um fluxo de orçamento simplificado.
- Prover um painel administrativo robusto para gestão de produtos, blog, leads e configurações.

---

## 👥 Público-Alvo
1.  **Clientes Institucionais**: Escolas, condomínios, clubes e prefeituras.
2.  **Especificadores**: Arquitetos, engenheiros e designers de interiores.
3.  **Parceiros**: Revendedores e representantes comerciais (Área do Revendedor).
4.  **Gestores Internos**: Equipe de marketing e comercial da Krenke.

---

## 🚀 Funcionalidades Principais (User Stories)

### 1. Experiência do Visitante (Frontend)
- **Catálogo de Produtos Inteligente**: Busca e filtragem por categoria com visualização de especificações técnicas (Polímero Rotomoldado, ABNT, etc.).
- **Fluxo de Orçamentos (Lead Generation)**: Carrinho de orçamento intuitivo onde o cliente pode selecionar múltiplos produtos e enviar dados de contato.
- **Showcase de Projetos**: Galeria de fotos de instalações reais para validação social.
- **Blog & Conteúdo**: Sessão de notícias e insights sobre lazer, segurança infantil e novidades da fábrica.
- **Downloads Técnicos**: Acesso fácil a manuais e catálogos em PDF.

### 2. Gestão Administrativa (Admin Dashboard)
- **Gestão de Produtos (CMS)**: CRUD completo de produtos, incluindo upload de imagens diretamente para o Supabase Storage.
- **Gestão de Leads**: Visualização e acompanhamento de solicitações de orçamento recebidas.
- **Editor de Blog**: Redação de artigos com editor Rich Text e gerenciamento de imagens de capa.
- **Sistema de Usuários**: Controle de acesso por níveis (Super Admin e Acesso Restrito).
- **Injeção de Scripts (Tags)**: Interface para gerenciar scripts de terceiros (Google Tag Manager, Facebook Pixel) sem necessidade de código.

---

## 🛠️ Stack Tecnológica (2026 Standard)
- **Core**: React 18+ com TypeScript e Vite.
- **Styling**: Tailwind CSS para design responsivo e moderno.
- **Animações**: Framer Motion para micro-interações e transições fluídas.
- **Backend as a Service (BaaS)**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Ícones**: Lucide React.
- **Roteamento**: React Router DOM.

---

## ✅ Critérios de Aceitação (AC)
- [ ] **Desempenho**: O site deve carregar em menos de 2s (LCP) em conexões 4G estáveis através do uso de Preloader e otimização de imagem (WebP).
- [ ] **Segurança**: Rotas administrativas `/pgadmin` devem ser protegidas por autenticação forte (JWT/Supabase).
- [ ] **Responsividade**: Layout adaptado para Mobile, Tablet e Desktop (breakpoints consistentes).
- [ ] **SEO**: Meta tags dinâmicas por página e estrutura semântica (H1-H3) para melhor ranqueamento.
- [ ] **Integração Comercial**: Leads devem ser salvos no banco de dados e disparar notificações (via Webhooks ou Edge Functions).

---

## 🗺️ Mapa de Páginas
- `Home`: Landing page com vídeo hero, destaques e diferenciais.
- `Sobre`: História da empresa, valores e certificações.
- `Produtos`: Grid de produtos com filtros laterais.
- `Projetos`: Galeria de fotos de parques instalados.
- `Blog`: Feed de notícias e páginas de artigo individual.
- `Downloads`: Central de materiais técnicos.
- `Orçamento`: Formulário final de coleta de dados.
- `Login`: Portal de acesso administrativo.
- `Admin`: Dashboard de controle total.

---

## 📅 Roadmap / Out of Scope
### In Scope (MVP+)
- Migração completa dos dados de produtos (JSON para SQL).
- Sistema de upload de imagens via Admin.
- Integração básica com GTag e Pixel.

### Out of Scope / Future Phases
- E-commerce transacional (Venda direta com checkout).
- Configurador de Playground 3D em tempo real no navegador.
- App Mobile nativo (iOS/Android).

---
*Documento gerado automaticamente para o projeto Krenke NextGen 2026.*
