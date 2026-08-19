# PROMPT — Replicar o site Krenke Brinquedos no Framer.com (projeto de teste)

> Cole este documento inteiro como briefing no Framer AI / para o designer que vai construir.
> Objetivo: reproduzir **fielmente** o site atual (React + Vite + Tailwind + GSAP, em `krenke.com.br`)
> dentro do Framer, com melhorias de performance, acessibilidade e consistência visual.
> Escopo = **site público**. Painel admin, área do revendedor, marketing e relatórios ficam de fora.

---

## 0. CONTEXTO DO PROJETO

**Empresa:** Krenke Brinquedos Pedagógicos LTDA — CNPJ 80.125.305/0001-69.
**Segmento:** maior fábrica de playgrounds e parques infantis do Brasil, fundada em **1987**.
**Diferencial técnico:** polímero rotomoldado, proteção UV industrial, certificação ABNT NBR 16071,
zero madeira/farpas, atóxico e reciclável.
**Público:** prefeituras, escolas privadas, condomínios, hotéis/resorts, shoppings, clínicas,
construtoras, licitações.
**Tom de voz:** enérgico, técnico e afirmativo. Títulos em CAIXA ALTA, `tracking` negativo,
peso 900 (black). Nada de tom pastel ou corporativo frio.

**Unidades:**
- Matriz: Rua Rodolfo Tepasse, 250 — Bairro Imigrantes, Guaramirim/SC — 89270-802 — (47) 3373-0693
- Filial Nordeste: Palmares/PE — (81) 99831-2244
- E-mail: comercial06@krenke.com.br
- Instagram: @krenkebrinquedos · Facebook: /krenkebrinquedosoficial · YouTube: @KrenkeBrinquedos

**Stack de origem (para referência, não replicar literalmente):** React 19, Vite 6, React Router 7,
Tailwind CSS v4, GSAP 3.15 (ScrollTrigger + SplitText), framer-motion 11, Supabase (CMS/banco),
Cloudflare R2 (imagens), Vercel (hosting), react-i18next (pt/en/es).

---

## 1. DESIGN SYSTEM (tokens exatos — criar como Color Styles / Text Styles no Framer)

### 1.1 Paleta

| Token | Hex | Uso |
|---|---|---|
| `krenke-purple` | `#312783` | Cor primária. Navbar, footer, heros, títulos |
| `krenke-orange` | `#F39200` | Laranja da marca (logo) |
| `vibrant-orange` | `#FF9F0A` | **CTA principal**, destaques, sublinhados, ícones ativos |
| `vibrant-purple` | `#4032B2` | Gradientes, cards, sombras coloridas |
| `vibrant-green` | `#2ECC71` | Confirmações, barras de stat |
| `vibrant-cyan` | `#00D1FF` | Acento terciário |
| `krenke-logo-green` | `#008D36` | Cores oficiais do logo (LP animada) |
| `krenke-logo-cyan` | `#009FE3` | idem |
| `krenke-logo-purple` | `#7F2082` | idem |
| `krenke-logo-pink` | `#E6007E` | idem (usado na barra de progresso de scroll) |
| Neutros | `#FFFFFF`, `#F8FAFC` (slate-50), `#F1F5F9` (slate-100), `#111827` (gray-900), `#6B7280` (gray-500), `#9CA3AF` (gray-400) | Fundos e texto |

**Cores por categoria de produto (usadas nos ShowcaseCards da Home):**
- Playgrounds Padrões `#f18915` · Little Play `#16462c` · Brinquedos Avulsos `#5f2c65`
- Aquáticos `#429ac6` · Mobiliários `#c14d89` · Temáticos `#284e9d`

**Regras de cor:**
- Máx. 4–6 cores vibrantes por viewport. Roxo e laranja dominam; o resto pontua.
- Texto corpo: `gray-500`/`gray-700` sobre claro; `white/85+` sobre roxo. Nunca cinza sobre cinza.
- Laranja `#F39200` sobre branco só em texto grande/bold (contraste limítrofe — ver §9 melhorias).

### 1.2 Tipografia

- **Fonte única:** **Nunito** (Google Fonts). Pesos usados: 400, 500, 600, 700, 800, **900**, itálico 700.
  → No Framer: subir a **variável Nunito (200–1000)** self-hosted em vez dos 7 pesos estáticos.
- Fonte display alternativa (só na LP animada): **Baloo 2**, pesos 600–800.

Text Styles a criar:

| Nome | Specs |
|---|---|
| `H1 Hero` | 40px mobile → 96px desktop (`clamp`), weight 900, `letter-spacing: -0.05em`, `line-height: 0.85`, UPPERCASE, `text-shadow: 0 20px 50px rgba(0,0,0,0.5)` |
| `H2 Section` | 36px → 72px, weight 900, tracking `-0.04em`, line-height 1.0, UPPERCASE |
| `H3 Card` | 24px → 32px, weight 900, tracking `-0.03em`, line-height 1.1, UPPERCASE |
| `Body L` | 18px → 24px, weight 500, line-height 1.6, cor `gray-500` |
| `Body` | 16px, weight 500/700, line-height 1.5 |
| `Eyebrow / Chip` | 10–12px, weight 900, UPPERCASE, `letter-spacing: 0.3em` |
| `Button` | 14px → 20px, weight 900, UPPERCASE, `letter-spacing: 0.05em` |
| `Meta` | 10px, weight 900, UPPERCASE, tracking `0.2em`, cor `gray-400` |

### 1.3 Forma, sombra e movimento

| Token | Valor |
|---|---|
| Raio card grande | `2.5rem` (40px) e `3rem` (48px) |
| Raio card médio | `2rem` (32px) |
| Raio botão | `1rem`–`2rem` (16–32px) |
| Raio chip / pill | `9999px` |
| `shadow-premium` | `0 20px 50px -12px rgba(0,0,0,0.25)` |
| `shadow-vibrant-orange` | `0 20px 40px -10px rgba(243,146,0,0.3)` |
| `shadow-vibrant-purple` | `0 20px 40px -10px rgba(49,39,131,0.3)` |
| `shadow-vibrant-green` | `0 20px 40px -10px rgba(46,204,113,0.3)` |
| Glass premium | `background: rgba(255,255,255,0.05)` + `backdrop-filter: blur(12px) saturate(180%)` + `border: 1px solid rgba(255,255,255,0.1)` |
| Container | `max-width: 1280px`, padding lateral `16px / 24px / 32px` |
| Ritmo vertical de seção | `py-20` (80px) a `py-32` (128px) |
| Easing padrão | `cubic-bezier(0.16, 1, 0.3, 1)` (equivale a `power3.out` / `expo.out`) |
| Duração padrão | entradas 0.7–1.0s · micro-interações 0.15–0.3s |

**Keyframes globais a recriar no Framer (loops infinitos):**
- `vibrant-pulse` — 3s: `opacity 1→0.8→1`, `scale 1→1.05→1` (usado nos pontinhos laranja dos badges)
- `float` — 6s: `translateY 0 → -20px → 0`
- `gradient-x` — 15s: `background-position` esquerda → direita → esquerda em `background-size: 200%`
  (usado nos títulos com gradiente laranja→amarelo→laranja em `bg-clip-text`)
- `btn-white-pulse` — 2.5s: anel `box-shadow` branco pulsante em botões outline

---

## 2. ARQUITETURA DE PÁGINAS (rotas)

Replicar exatamente estas rotas públicas:

| Rota | Página | Layout |
|---|---|---|
| `/` | Home | Layout padrão + mapa |
| `/empresa` | Nossa Trajetória (About) | Layout padrão |
| `/produtos` | Catálogo de produtos | Layout padrão |
| `/produtos/categoria/:slug` | Produtos filtrados por categoria | Layout padrão |
| `/blog` | Listagem do blog | Layout padrão |
| `/blog/:slug` | Post individual | Layout padrão |
| `/projetos` | Galeria de vídeos de projetos | Layout padrão |
| `/downloads` | Central de recursos (PDFs) | Layout padrão |
| `/catalogo` | Catálogo folheável (PDF gated por lead) | Layout padrão |
| `/orcamento` | Formulário de orçamento | Layout padrão |
| `/trabalhe-conosco` | Vagas + candidatura | Layout padrão |
| `/politica-de-privacidade` | Privacidade | Layout padrão |
| `/termos-de-uso` | Termos | Layout padrão |
| `/lp` | Landing page de campanha | **Sem** navbar/footer padrão |
| `/lp-animada` | LP com scroll-animation | **Sem** navbar/footer padrão |
| `/obrigado` | Thank-you page (lead) | Sem layout |
| `/obrigado-curriculo` | Thank-you page (currículo) | Sem layout |

Slugs de categoria: `playgrounds-padroes`, `little-play`, `brinquedos-avulsos`, `mobiliarios`,
`aquaticos`, `tematicos`.

**Fora do escopo:** `/pgadmin/*`, `/revendedor`, `/marketing`, `/relatorio`, `/login`.

---

## 3. COMPONENTES GLOBAIS

### 3.1 ScrollProgress (barra de leitura)
Barra de 4px fixa no topo (`z-index` acima da navbar), `aria-hidden`.
Gradiente `#FF9F0A → #E6007E → #4032B2`, `box-shadow: 0 0 12px rgba(255,159,10,0.6)`.
Escala horizontal de 0 → 1 conforme o progresso de scroll da página (origem à esquerda, scrub suave ~0.3s).

### 3.2 Navbar (fixa, full-width, `z-50`)

Dois estados controlados pelo scroll (`scrollY > 20px`):

| | Topo (padrão) | Rolado |
|---|---|---|
| Padding vertical | 16px | 8px |
| Fundo | `#312783` + borda inferior `white/10` | `#312783` sólido + `shadow-premium` |
| Altura do logo | 64px | 40px |
| Top bar | visível (44px) | colapsa para 0 |

**Top bar** (desktop): telefone `(47) 3373-0693` + e-mail `comercial06@krenke.com.br` à esquerda;
à direita: pill "Área do Revendedor" (com bolinha laranja pulsante) · divisor · **seletor de idioma**
(3 bandeiras 28×20px: BR/US/ES — ativa com `ring-2` laranja, inativas 60% opacidade, hover `scale 1.25`)
· divisor · ícones Instagram/Facebook/YouTube (hover → laranja).

**Linha principal:** logo branco à esquerda (hover `scale 1.05` + `rotate -2°`).
Menu desktop (≥1024px): `Home · Empresa · Produtos ▾ · Trabalhe Conosco · Catálogo` — 14px, weight 900,
UPPERCASE, `tracking 0.1em`, branco; hover → laranja + sublinhado de 2px que cresce de 0 → 100% da esquerda.
**Dropdown "Produtos":** painel 288px, `bg #312783/95` + `backdrop-blur 48px`, raio 24px,
borda `white/20`, entra com `translateY(16px) → 0` + fade em 300ms; lista as 6 categorias.
Botão CTA à direita: **"Orçamento"** — fundo `#FF9F0A`, raio 16px, hover `scale 1.1` + `shadow-vibrant-orange`.

**Mobile (<1024px):** botão hambúrguer 48×48 (glass, raio 16px). Drawer full-screen `#312783`
que entra da direita com spring (`damping 25, stiffness 200`), **arrastável para fechar**
(swipe > 100px ou velocidade > 500). Dentro: label "Navegação", botão fechar, pill "Área do Revendedor",
links empilhados com borda inferior `white/10`, acordeão de Produtos (chevron rotaciona 180°),
CTA "Orçamento" laranja e o seletor de idioma centralizado.

### 3.3 Footer

Fundo `#312783`, `padding-top: 128px`, `padding-bottom: 48px`, `overflow: hidden`.
- Faixa de 4px no topo: gradiente `vibrant-orange → vibrant-purple → vibrant-green`.
- Blob decorativo: círculo 384px `vibrant-orange/10`, `blur 100px`, canto inferior direito.
- Grid 12 colunas (empilha em mobile):
  - **col 1–5:** logo "marca playgrounds" branco (80px alt), bio: *"Desde 1987 transformando espaços em mundos de pura diversão com segurança absoluta e design de elite."*, 3 botões sociais 48×48 (raio 16px, `bg white/5`, borda `white/10`, hover sobe 5px e fica laranja).
  - **col 6–8:** título "Nossos Produtos" (laranja, 14px, weight 900, `tracking 0.2em`); links: Home, Empresa, Produtos, Trabalhe Conosco, Catálogo — cada um com um traço laranja que cresce de 0 → 16px no hover.
  - **col 9–12:** título "Contato Direto"; 5 blocos ícone+texto (ícone em quadrado 48px `white/5` raio 16px):
    - 📞 (47) 3373-0693 — Matriz - Santa Catarina
    - 📞 (81) 99831-2244 — Filial - Nordeste
    - ✉️ comercial06@krenke.com.br — Suporte e Dúvidas
    - 📍 Guaramirim, SC — Sede de Produção
    - 📍 Palmares, PE — Filial Nordeste
- **Barra legal:** `© {ano} Krenke Brinquedos Pedagógicos LTDA. CNPJ: 80.125.305/0001-69 — Engenharia da Diversão.`
  À direita: Cookies · Privacidade · Termos · Área do Revendedor · Trabalhe Conosco.

### 3.4 MapSection (**só na Home**, entre conteúdo e footer)
Bloco full-width de 600px com `<iframe>` do Google Maps (Krenke Guaramirim).
Mapa em grayscale + leve invert; **no hover do bloco inteiro** volta a cores, brilho e escala normais
numa transição de 1000ms. Faixa de 6px no topo com o gradiente da marca.
Card flutuante glass (`white/80` + `blur 32px`, raio 40px, `min-width 280px`) sobre o mapa:
chip "UNIDADE INDUSTRIAL" (bolinha laranja pulsante) → `Guaramirim / SC` (H3 roxo) →
`Rua Rodolfo Tepasse, 250 / Bairro Imigrantes - 89270-802` → botão roxo "VER ROTAS"
(hover laranja) linkando o Google Maps directions.

### 3.5 ContactLauncher (FAB — canto inferior direito, `z-95`)
Botão circular 56px (mobile) / 64px (desktop), gradiente `vibrant-orange → krenke-orange`,
`shadow 0 8px 30px rgba(243,146,0,0.45)`, com dois anéis animados (`ping` 20% + `pulse` 40%)
quando fechado. Ícone alterna entre `MessagesSquare` e `X` com rotação de ±90° + fade.
Ao clicar, abre speed-dial com 2 opções (spring, stagger 50ms), cada uma = pill branca de rótulo +
círculo colorido de 48px:
1. **WhatsApp** — círculo `#25D366`; sub: "Atendimento online" (ou "Deixe sua mensagem" fora do horário comercial) → abre mini-form (nome + telefone + mensagem) que redireciona para `wa.me/554733730693`.
2. **Chat ao vivo** — círculo `#312783`; sub: "Converse pelo site" → abre o widget de chat.

### 3.6 CookieConsent
Banner inferior com aceitar/recusar; a preferência persiste em `localStorage` (`krenke-cookie-consent`).
O link "Cookies" no rodapé limpa a preferência e reabre o banner.

---

## 4. PÁGINA POR PÁGINA — SEÇÕES E COPY EXATA

### 4.1 HOME `/`

Ordem das seções: **Hero → Features → CategoryPreview → Stats → Instagram → Blog → Diferenciais → Tabela Comparativa → Carrossel → Mapa → Footer**

#### 4.1.1 Hero
- Altura `85vh`, fundo `#312783`, `overflow: hidden`, conteúdo centralizado.
- **Fundo:** vídeo do YouTube em loop mudo (`C_KbvW2MjB8`), iframe dimensionado a 300%×300%
  centralizado, `opacity 0.7`, `pointer-events: none`.
  → **Melhoria obrigatória:** carregar o vídeo só **após o `load`** da página (idle), com fade-in.
- **Overlays:** gradiente `#312783/80 → #312783/60 → blue-900/60` em `mix-blend-multiply` +
  camada `black/10` + fade branco de 48px na base.
- **Badge:** pill glass (`white/10`, `blur 24px`, borda `white/20`) com bolinha laranja pulsante:
  `Desde 1987 • A maior fábrica de playgrounds do Brasil`
- **H1** (duas linhas):
  - Linha 1: `PLAYGROUNDS E` — branco, **revelada caractere a caractere**
  - Linha 2: `PARQUES INFANTIS` — gradiente `#FF9F0A → yellow-400 → #FF9F0A` em `bg-clip-text`, com o loop `gradient-x`, subindo de dentro de uma máscara
- **Subtítulo:** `Transformamos espaços em mundos de pura diversão com segurança absoluta.`
- **CTAs (lado a lado, empilham no mobile), ambos com efeito magnético (§6.5):**
  1. `Explorar Produtos →` — laranja sólido, raio 16px, `shadow 0 20px 40px -10px rgba(243,146,0,0.5)`; a seta desliza 8px no hover
  2. `Fazer Orçamento` — glass `white/10` + borda `white/30`; no hover fica branco com texto roxo
- **Indicador de scroll:** cápsula 24×40 com borda `white/30` e um ponto branco de 6×12 fazendo bob
  vertical de 10px (yoyo, 1.1s). Escondido no mobile.
- **Coreografia de entrada** (timeline única):
  `0.1s` badge desce · `0.3s` H1 linha 1 (chars, stagger 0.02) · `0.45s` linha 2 sobe da máscara (1.3s)
  · `1.0s` descrição · `1.15s` CTAs (stagger 0.12) · `1.5s` indicador de scroll.
- **Saída por scroll (parallax):** o vídeo desce `+18%` e o conteúdo sobe `-20%` desaparecendo,
  ambos amarrados 1:1 ao scroll.

#### 4.1.2 Features — 3 cards
Fundo branco, `py-20`, grid de 3 colunas, entrada em cascata (stagger 0.12, 60px).
Cada card: `padding 40px`, raio `2.5rem`, `shadow-2xl`, ícone dentro de quadrado 80px `white/20`
rotacionado 12° que endireita no hover; card sobe 16px e escala 1.02 no hover.

| # | Ícone | Título | Texto | Fundo |
|---|---|---|---|---|
| 1 | Award | **Desde 1987** | A maior e mais premiada fábrica de playgrounds do Brasil. | roxo |
| 2 | CheckCircle | **Segurança 360°** | Produtos robustos em conformidade total com a ABNT. | laranja |
| 3 | PenTool | **Alta Tecnologia** | Polímeros de última geração com proteção UV industrial. | roxo |

#### 4.1.3 CategoryPreview — trilho horizontal **pinado** (assinatura da página)
Fundo gradiente `white → slate-100`, `py-32`.
- Título: `Explore Nossa Linha de` (roxo) + `Playgrounds` (laranja) — reveal por palavras, a 2ª metade com delay de 0.15s.
- Subtítulo: `Produtos certificados pela ABNT com durabilidade extrema. O melhor investimento para o lazer das crianças.`
- Traço laranja de 150×8px com glow, entrando em escala.
- **Comportamento:**
  - **Desktop (≥1024px):** a seção é **pinada** por `100vh` e o trilho de cards translada no eixo X conforme o scroll (scrub 1:1), revelando todos os 6 cards. Abaixo, barra de progresso de 4px (`max-width 448px`) que enche de 0 → 100%.
  - **Mobile/tablet:** carrossel horizontal nativo com `scroll-snap: center`, sem pin. Nenhum card pode ficar inacessível.
- **ShowcaseCard** (largura `85vw` mobile / 420px desktop, altura `clamp(460px, 68vh, 640px)`):
  fundo = cor da categoria a 95%, raio 48px, borda `white/20`, `shadow-premium`.
  Estrutura: glow difuso (círculo 256px branco `blur 80px`, canto superior direito) → subtítulo (10–12px,
  `tracking 0.3em`, `white/70`) → título H3 branco → moldura branca interna (raio 32px) com a imagem
  em `object-contain` → botão branco "Ver Produtos" com a cor da categoria no texto.
  **Hover (timeline única, 0.45s):** card sobe 20px + ganha `shadow 0 40px 80px -15px {cor}99`;
  glow escala 1.25 e vai a 50% opacidade; moldura escala 1.05; imagem escala 1.1; título sobe 4px;
  subtítulo vai a 100%; e uma **barra branca de 6px preenche a base de 0 → 100%**.
  O mesmo estado deve disparar em `focus` (teclado).

| Categoria | Subtítulo | Descrição | Cor |
|---|---|---|---|
| Playgrounds Padrões | Linha Profissional Certified | Estruturas completas que garantem diversão máxima com total segurança para todas as idades. | `#f18915` |
| Little Play | Para Pequenos Exploradores | Diversão sob medida para os pequenos, com segurança e ergonomia. | `#16462c` |
| Brinquedos Avulsos | Acessórios e Lúdicos | Peças individuais perfeitas para complementar seu espaço de lazer com variedade. | `#5f2c65` |
| Aquáticos | Diversão na Água | Estruturas interativas para diversão na água com total segurança. | `#429ac6` |
| Mobiliários | Design e Conforto Urbano | Bancos e acessórios duráveis que trazem conforto e beleza para áreas externas. | `#c14d89` |
| Temáticos | Aventuras de Imaginação | Aventuras lúdicas com playgrounds inspiradores que estimulam a imaginação. | `#284e9d` |

- CTA final centralizado: `SOLICITAR ORÇAMENTO COMPLETO →` — gradiente `#F39200 → orange-500`,
  raio 16px, magnético.

#### 4.1.4 StatsSection (`id="sobre-nos"`)
Fundo branco, `py-32`, dois blobs de blur (roxo 500px canto sup. dir., laranja 400px canto inf. esq.).
Grid 2 colunas, gap 80px.
- **Esquerda** (entra da esquerda): chip `Nossa Essência` (laranja sobre `orange/10`);
  H3 duas linhas `QUALIDADE EM CADA` / `PLAYGROUND E BRINQUEDO` (2ª linha roxa, reveal por palavras);
  parágrafo: `Desde 1987, a Krenke lidera o mercado brasileiro com playgrounds que unem robustez técnica a um design focado na diversão e no desenvolvimento infantil.`
  Depois, **4 barras de progresso**: label à esquerda (10px, weight 900, `tracking 0.2em`) e
  **contador numérico animado 0 → 100%** à direita (laranja). As barras (altura 16px, raio full)
  enchem da esquerda **conforme o scroll** (scrub, stagger 0.08):
  1. Segurança Certificada — laranja
  2. Qualidade de Exportação — roxo
  3. Lazer Educativo — verde
  4. Felicidade Garantida — rosa
- **Direita** (entra em escala): imagem 600px em card raio 48px, **borda branca de 12px**,
  rotacionado 3° que endireita no hover (700ms), glow gradiente por trás (blur 32px, 20% opacidade).
  Badge laranja no canto superior direito: `Líder desde` / **`1987`** (48px, weight 900).
  A imagem interna faz **parallax vertical** (~±10%) e está escalada 1.18 para não mostrar bordas.

#### 4.1.5 InstagramFeed
Fundo branco, `py-32`. Chip laranja com ícone: `@krenkebrinquedos`.
H3: `Siga Nossas` (roxo) + `Aventuras` (laranja).
Embed quadrado do feed (máx 800px, raio 32px, `shadow-premium`).
CTA: `Seguir no Instagram` — gradiente roxo→laranja, magnético.
→ **Melhoria obrigatória:** o embed atual carrega ~3,3 MB de imagens. Substituir por **6–9 thumbnails
estáticas otimizadas** (WebP ~200px, hospedadas no próprio Framer) em grid 3×3, cada uma linkando
para o Instagram, com `loading="lazy"`.

#### 4.1.6 BlogPreview (3 posts mais recentes)
Fundo `slate-50`, `py-32`. Cabeçalho em duas colunas: à esquerda chip `Conteúdo & Insights` +
H3 `Últimas das` / `Nossas Novidades` (2ª linha laranja); à direita botão outline
`Ver Blog Todo →` (borda roxa de 4px, raio 32px, inverte no hover).
Grid de 3 cards (raio 48px, `shadow-premium`, entrada em escala com stagger 0.12):
imagem 4:3 (escala 1.1 no hover em 700ms) → meta (data + primeiro nome do autor, com ícones laranja)
→ título H4 roxo (vira laranja no hover, máx 3 linhas) → excerpt (2 linhas) →
`Continuar Lendo →` laranja com gap que aumenta no hover.
Se não houver posts publicados, a seção **não é renderizada**.

#### 4.1.7 Differentials — 6 cards
Fundo `slate-50`, `py-32`. Título `DIFERENCIAIS QUE` / `IMPULSIONAM O MERCADO` (2ª linha roxa).
Grid 3 colunas, entrada em escala (stagger 0.09).
Card branco, `padding 40px`, raio 40px, `shadow-premium`; barra de 8px no topo na cor do item;
ícone 64px em quadrado com a cor a 12% de opacidade, rotaciona 12° no hover; card sobe 12px no hover.

| Título | Texto | Ícone | Cor |
|---|---|---|---|
| Foco no Ser Humano | Atendimento personalizado para transformar sua visão em realidade. | HeartHandshake | `#FF9F0A` |
| Sob Medida | Soluções flexíveis desenhadas para a sua necessidade específica. | Calculator | `#4032B2` |
| Logística Inteligente | Processos otimizados para garantir a entrega mais rápida do país. | Truck | `#2ECC71` |
| Qualidade de Ferro | Materiais premium e fornecedores certificados de alto padrão. | ShieldCheck | `#00D1FF` |
| Projetos 3D | Visualize seu parque antes mesmo da instalação começar. | Zap | `#F32051` |
| Pagamento Facilitado | Condições flexíveis que cabem no planejamento do seu projeto. | CreditCard | `#8B5CF6` |

#### 4.1.8 ComparativeTable — "A Superioridade Krenke"
Fundo branco, `py-32`. Título `A Superioridade` (roxo) + `Krenke` (laranja).
Subtítulo: `Por que somos a primeira escolha de quem preza pela máxima segurança.`
Tabela em card raio 48px, `shadow-premium`, com scroll horizontal no mobile (largura mínima 600px).
**Cabeçalho (3 colunas):** `Especificações Técnicas` (50%, fundo roxo) · `Mercado Comum` (25%, fundo
cinza — **usar `#475569` em vez do `#94A3B8` atual**, ver §9) · logo Krenke branco (25%, fundo laranja).
Linhas entram em cascata (stagger 0.045). Hover da linha → fundo `slate-50`.
Ícones: ✅ verde / ❌ vermelho (quadrado 48px, raio 16px) na coluna "comum";
✅ laranja 56px na coluna Krenke (escala 1.25 + rotate 6° no hover). Célula Krenke com fundo `orange-50/20`.

| Especificação | Mercado Comum | Krenke |
|---|---|---|
| Polímero Rotomoldado | ❌ | ✅ |
| Resistente a ferrugem e apodrecimento | ❌ | ✅ |
| Conforto térmico (Não aquece como metal) | ❌ | ✅ |
| Totalmente livre de farpas (Madeira zero) | ❌ | ✅ |
| Alta durabilidade (Sol, Chuva e Intempéries) | *Baixa* | ✅ |
| Baixa Manutenção (Dispensa pintura e verniz) | ❌ | ✅ |
| Pigmentação UV Industrial (Não desbota fácil) | *Algumas* | ✅ |
| Cantos arredondados (Segurança anti-impacto) | ❌ | ✅ |
| Material atóxico e 100% Reciclável | ❌ | ✅ |
| Certificação de Segurança ABNT | *Raras* | ✅ |

#### 4.1.9 ImageCarousel (fechamento)
Fundo branco, `py-32`. Título `Espaços Transformativos` / `Memórias Inesquecíveis` (2ª linha laranja).
Subtítulo: `Somos especialistas em criar ecossistemas de lazer que encantam e inspiram gerações.`
Carrossel de 5 fotos de playgrounds instalados: 3 visíveis no desktop, 2 no tablet, 1 no mobile.
Cards 500px de altura, raio 48px, gap 32px. Autoplay a cada 4s (pausa no hover — **adicionar**).
Hover: escala 1.02 + sobe 20px, e um gradiente roxo revela a legenda `Projeto EXCLUSIVO #N`.
Setas: dois botões brancos 64×64 raio 16px abaixo do trilho (desktop), invertem para roxo no hover.

---

### 4.2 EMPRESA `/empresa`

**Hero** (450px mobile / 600px desktop, fundo roxo):
gradiente `krenke-purple → vibrant-purple → vibrant-orange` a 60% em `multiply` +
textura de cubos a 20% que **rotaciona lentamente 4° e escala 1.15 num loop yoyo de 24s**.
Conteúdo alinhado à esquerda: chip `Excelência desde 1987` (entra de -30px na horizontal) →
H1 `NOSSA` (branco, chars) / `TRAJETÓRIA` (gradiente laranja, sobe da máscara) →
traço laranja 200×12px que cresce da esquerda. Fade branco de 128px na base.

**Seção "Essência Krenke"** (`py-32`, 2 colunas):
- Esquerda: chip roxo `Essência Krenke`; H2 `PROJETANDO O` / `FUTURO DO LAZER` (2ª linha laranja);
  parágrafo: `Mais que playgrounds, criamos ecossistemas de desenvolvimento infantil onde a segurança absoluta encontra a diversão extrema.`
  4 barras com ícone + contador 100% (scrub, stagger 0.08):
  ShieldCheck `Segurança Certificada ABNT` (laranja) · Award `Qualidade de Exportação` (roxo) ·
  Zap `Inovação Tecnológica` (verde) · Globe `Felicidade & Lazer` (rosa).
- Direita: card `min-height 650px`, raio 48px, **borda branca 12px**, rotacionado 3°, com **vídeo
  em loop mudo** da fábrica (grayscale 0.2 que some no hover em 1000ms). Badge laranja no topo:
  `Dando vida ao lazer` / **`1987`**. Legenda inferior: `Nosso Complexo Industrial` /
  `Guaramirim, Santa Catarina` (laranja).

**Seção "História"** (fundo `slate-50`, `py-32`, texto à esquerda / imagem à direita):
H2 `UMA` + `HISTÓRIA` (roxo) + `DE LIDERANÇA`.
- P1: **A Krenke Brinquedos Pedagógicos LTDA** não apenas fabrica equipamentos; nós definimos o padrão nacional de excelência em diversão desde 1987.
- Citação (borda esquerda laranja de 4px, itálico): *"Trabalhamos incansavelmente para que cada parquinho entregue seja um monumento à segurança e à infância feliz."*
- P2: Investimos continuamente em tecnologia de ponta alemã para processamento de polímeros, garantindo que nossos Playgrounds resistam bravamente às intempéries do tempo, mantendo cores vibrantes e estruturas inabaláveis.
- Imagem da fachada, raio 48px, com **parallax** e escala 1.18 → 1.24 no hover. Selo Award glass no canto superior esquerdo.

**Seção "Presença Nacional"** (fundo branco, `py-32`, imagem à esquerda / texto à direita):
Imagem da filial nordeste (parallax, escala 1.18 → 1.28 no hover) com overlay laranja no hover
exibindo `Atendimento Ágil em Todo o Brasil`.
H2 `PRESENÇA` / `NACIONAL` (2ª linha laranja).
- P1: Para atender de forma mais veloz a demanda crescente do Nordeste Brasileiro, a Krenke estabeleceu um hub estratégico em **Palmares, Pernambuco**.
- Dois mini-cards (`slate-50`, raio 32px, sobem 8px no hover): **Nordeste** / `Logística Local` (laranja) e **Expertise** / `Projetos Locais` (roxo).
- P2: Esta expansão não é apenas sobre logística; é sobre estar perto de nossos clientes, entendendo as nuances climáticas e regionais para entregar a melhor solução em lazer do país.

---

### 4.3 PRODUTOS `/produtos` e `/produtos/categoria/:slug`

**Hero** (450/550px, roxo, alinhado à esquerda, largura de conteúdo 85%):
textura de cubos com parallax; chip `Linha Completa 2026` (ou `Linha {Categoria} 2026`);
H1 em gradiente laranja: `DIVERSÃO` (ou o nome da categoria) subindo da máscara; traço laranja 128×12px.
A entrada **reanima a cada troca de categoria**.

**Barra de busca flutuante** (sobrepõe o hero em `-80px`): card branco raio 48px, `shadow-premium`,
`padding 24/48px`. À esquerda: input com ícone de lupa laranja, placeholder
`Pesquisar Parques, Playgrounds ou Código...`, fundo `slate-50`, raio 24px, foco → borda laranja.
À direita (desktop): `Mostrando` / **`{N} Itens`** em 24px roxo. No mobile, mostrar chip
`Filtrando: {Categoria}`.

**Layout principal:** sidebar de 320px **sticky** (`top: 112px`) + grid.
- Sidebar: título `Filtrar por Categoria` com ícone Filter laranja; botões full-width
  (raio 16px, 12px, weight 900, UPPERCASE) — ativo = fundo roxo + texto branco + sombra;
  inativo = texto cinza, hover `slate-100`.
  Categorias: `Todos`, `Playgrounds Completos`, `Little Play`, `Brinquedos Avulsos`, `Linha Pet`,
  `Mobiliário Urbano e Jardim`, `LINHA TEMÁTICA`.
- Grid: 1/2/3 colunas, gap 48px. **Card de produto:** branco, raio 40px, `shadow-premium`;
  imagem quadrada `object-contain` (escala 1.05 no hover); chip laranja da categoria;
  H3 roxo `#332984` 32px (vira laranja no hover); `REF: {código}`;
  rodapé com `Explorar Detalhes` + círculo de seta 48px que fica laranja e **rotaciona -45°** no hover.
  Card inteiro sobe 16px no hover.
  **Entrada:** cascata em lotes conforme entram na viewport (`start: top 90%`, stagger 0.08, 0.7s).
- Estado vazio: card tracejado, `Nada Encontrado` + botão `Limpar Filtros`.

**Modal de produto** (abre por query param `?produto={id}`, `z-100`):
backdrop roxo 80% com `blur 24px`; painel branco raio 48px, 95vh/90vh, entra com `scale 0.9 → 1`
e `y 50 → 0`. Botão fechar 48px flutuante no canto superior direito (fica laranja no hover).
- **Esquerda (50%):** imagem principal grande (`object-contain`, máx 650px) com crossfade ao trocar;
  abaixo, `Galeria de Fotos` com thumbnails 96px (borda laranja de 4px na ativa, sobem 4px no hover).
- **Direita (50%):** chip da categoria → H2 do nome (40–48px, weight 900) → **tabela de especificações
  técnicas** (ver estilo abaixo) → botão full-width `Adicionar ao Orçamento` (laranja; vira verde
  com `Adicionado ao Orçamento ✓`) → rodapé com `Ref: {id}`.
- **Estilo da tabela de specs:** linhas alternadas `#f8fafc`; primeira coluna 35–45%, roxo `#362B86`,
  weight 900, UPPERCASE; segunda coluna `#475569` weight 600; padding `20px 24px`; raio 24px;
  `<strong>` vira laranja `#FF9F0A`; `.highlight` = pill âmbar.

**Carrinho de orçamento (barra flutuante, `z-90`, centro-inferior):**
aparece quando há ≥1 item; persiste em `localStorage`. Barra branca raio 32px, `shadow-premium`:
ícone de carrinho em círculo laranja 48px com badge verde de contagem (anima ao mudar) →
`Itens no` / `Orçamento` → botão preto `Finalizar →` (fica laranja no hover) que leva a `/orcamento`.
Clicar na barra expande um painel (máx 300px de altura, rolável) com miniatura, nome, categoria e
botão de remover por item + botão de limpar tudo.

---

### 4.4 ORÇAMENTO `/orcamento`

**Hero** (450/600px, roxo): blob laranja pulsando (15s) + textura de cubos;
chip `Projetos Customizados` com ícone Sparkles; H1 `TRANSFORME` / `SEU ESPAÇO` (2ª linha laranja);
traço laranja que cresce até 200px. Fade `slate-50` na base.

**Card do formulário** (sobrepõe o hero em `-80px`, máx 896px, raio 48px, `shadow-premium`):
- Faixa superior de 8px com gradiente animado `laranja → roxo → verde`.
- Título: `PROPOSTA` + `RÁPIDA` (laranja).
  Sub: `Preencha os dados abaixo para receber um orçamento detalhado em tempo recorde.`
- **Campos** (todos: fundo `slate-50`, raio 16px, `padding 20px 32px`, weight 900,
  borda transparente → colorida no foco; label acima em 10px UPPERCASE `tracking 0.2em` cinza):

| Label | Tipo | Obrigatório | Detalhe |
|---|---|---|---|
| Identificação | texto | ✅ | mín. 3 caracteres · foco laranja |
| Telefone / WhatsApp | telefone internacional | ✅ | seletor de país (padrão BR) + validação · foco roxo |
| Tipo de Cliente | select | ✅ | Pessoa Física · Pessoa Jurídica · Órgão Público |
| Seu E-mail Corporativo | e-mail | ✅ | foco ciano |
| Estado | select | ✅ | 27 UFs |
| Cidade | select | ✅ | **carrega dinamicamente** conforme o estado (API IBGE); desabilitado até escolher UF |
| Segmento | select | ✅ | Hotel / Resort · Condomínio · Escola Privada · Prefeitura / Órgão Público (Compra Direta) · Shopping / Área Comercial · Clínica / Hospital · Construtora (Compra Direta) · Licitação · Outros |
| *(condicional)* Qual o seu segmento? | texto | ✅ se "Outros" | expande com animação de altura |
| Produtos Desejados | multi-seleção | ✅ ≥1 | ver abaixo |
| Detalhes do Projeto | textarea 4 linhas | ✅ | placeholder: `Descreva seu espaço, público-alvo ou necessidades específicas...` |

- **Seletor de produtos:** contador `{N} Selecionados` em laranja; campo de filtro
  (`Filtrar por nome ou categoria...`); grid de 2 colunas com divisores
  `✓ Selecionados` e `Todos os Produtos`. Card de produto = ícone (✓ laranja quando selecionado,
  + cinza quando não) + nome + categoria + miniatura. **Selecionados sobem para o topo.**
  No mobile mostra 8 itens + botão `Ver todos os produtos (+N)`.
- **Anti-spam:** campo honeypot escondido + captcha invisível.
- **Botão:** full-width, laranja, `padding 32px`, raio 40px, texto `SOLICITAR PROPOSTA AGORA`
  com ícone Send; efeito de brilho que atravessa no hover (1s); desabilitado até tudo válido;
  estado de envio: spinner + `ENVIANDO...`.
- Mensagens de erro (vermelho) e sucesso (verde) em cards de 24px com raio 16px.
- **Após enviar:** redireciona para `/obrigado` e limpa o carrinho.
- O carrinho vindo de `/produtos` **pré-preenche** a seleção de produtos.

---

### 4.5 PROJETOS `/projetos`

Hero roxo padrão: chip `Projetos ao Redor do País`; H1 `ONDE O` / `RISO ACONTECE` (2ª linha laranja).
Grid de 2 colunas, gap 48px, `py-32`. Card por projeto (raio 32px, sobe 16px no hover, com glow
externo colorido a 20% no hover):
- Thumbnail 16:9 do YouTube (escala 1.10 no hover em 1000ms), overlay roxo que clareia no hover,
  botão play glass circular de 96px no centro.
- Badge de localização no canto superior esquerdo (fundo `black/50` + blur, ícone MapPin laranja).
- Corpo: H3 (vira laranja no hover); texto itálico com borda esquerda que fica laranja no hover:
  `Testemunhe a qualidade impecável da Krenke em ação neste projeto exclusivo.`;
  rodapé `Galeria de Vídeo` + `Assistir Agora ›`.

| Título | Local | YouTube ID | Acento |
|---|---|---|---|
| Playground Avião | Colégio Fag \| Cascavel-PR | `XeBQf3CaNuI` | laranja |
| Maior Tobogã do Sul | Parque Terra Atlântica \| Penha-SC | `O2M2Aa4gmL0` | roxo |
| Conheça nossa Fábrica | Guaramirim - SC | `q_vGGYCRYec` | verde |
| Brinquedos Krenke | Institucional | `l2Cj1TE2tMI` | ciano |

**Modal de vídeo:** backdrop roxo 95% + blur 32px; player 16:9 máx 1152px, raio 48px, entra com
`scale 0.9 → 1`; botão fechar 64px raio 32px no canto superior direito (fica laranja no hover).

---

### 4.6 BLOG `/blog` e `/blog/:slug`

**Listagem:** hero de 500/650px com blob roxo que rotaciona lentamente (30s);
chip `Universo Krenke`; H1 `INSIGHTS &` / `INFORMAÇÃO` (2ª linha laranja);
parágrafo com borda esquerda laranja: `Mergulhe nas tendências pedagógicas, segurança em playgrounds e as últimas novidades do mundo do lazer infantil.`
Busca sobreposta (`-96px`): input de 32px em card branco raio 40px com glow gradiente que intensifica
no foco; placeholder `Encontre artigos, dicas e guias...`.
Grid de 3 colunas, gap 48px, cards raio 48px que sobem 16px no hover com glow laranja/roxo;
imagem 4:3 (grayscale 0.2 → colorida no hover), badge `Novidades` laranja, meta (data + `5 min leitura`),
H2 do título (vira laranja no hover), excerpt itálico de 3 linhas, rodapé com autor + `Explorar Artigo →`.
Skeletons durante o carregamento. Estado vazio: `Artigo não encontrado` + `Ver todos os posts`.

**Post individual:** hero com imagem de capa, título, autor, data; corpo em prosa
(máx 720px, 18–20px, `line-height 1.8`, H2/H3 roxos, citações com borda laranja, imagens raio 24px);
CTA final para `/orcamento`; 3 posts relacionados.

---

### 4.7 DOWNLOADS `/downloads`

Hero roxo padrão: chip `Central de Recursos`; H1 `DOWNLOADS` / `TÉCNICOS`.
Grid de 2 colunas (sobrepondo o hero em `-80px`). Card branco `padding 48px`, raio 40px, sobe 10px
no hover, com glow colorido; ícone 96px em quadrado com a cor a 10%; título + chip `PDF • {tamanho}`;
descrição itálica; botão preto (fica laranja no hover) `⤓ Baixar Agora`.

| Título | Descrição | Tipo | Acento |
|---|---|---|---|
| Catálogo Geral 2026 | Linha completa de playgrounds, mobiliário urbano e brinquedos interativos. | PDF · 16 MB | laranja |
| Manual de Instalação | Guia técnico detalhado para preparação do terreno e montagem segura. | PDF · 12 MB | roxo |
| Certificações de Segurança | Laudos técnicos e conformidades com as normas ABNT NBR 16071. | PDF · 5 MB | verde |
| Guia de Manutenção | Cronograma e procedimentos para garantir a longevidade do seu parque. | PDF · 3 MB | ciano |

**Bloco final** (roxo, raio 64px, `padding 64px`, faixa gradiente no topo):
`NÃO ENCONTROU O QUE **PROCURAVA?**` + `Nossa equipe técnica pode fornecer arquivos CAD,
especificações customizadas e detalhes sob medida para seu projeto.` + botão laranja
`Solicitar Suporte Técnico` (deve linkar para `/orcamento`).

---

### 4.8 CATÁLOGO `/catalogo`

Chip `Mobiliário e Lazer`; H1 `Catálogo` / `Geral 2026` (laranja);
sub: `Explore a linha completa de playgrounds e estruturas da Krenke. Projetados para inspirar aventuras e garantir a máxima segurança e durabilidade.`

**Gate de lead** (antes de liberar o catálogo): card branco máx 576px, raio 40px, ícone de usuário
em quadrado laranja; título `Identifique-se para acessar`; sub `Preencha os dados abaixo para liberar
o catálogo completo.` Campos: Nome Completo · E-mail Corporativo · WhatsApp · Cidade (busca com
autocomplete de municípios brasileiros). Botão escuro `ACESSAR AGORA` (fica laranja no hover).
Após enviar, o acesso persiste em `localStorage`.

**Visualizador:** desktop = **flipbook** de páginas duplas com efeito de virar página, sombra forte,
botão `⤓ Baixar PDF Completo` abaixo. Mobile = card com ícone de download e botão `Baixar PDF (16MB)`.
→ No Framer, se o flipbook não for viável, usar embed de PDF responsivo ou galeria de páginas com
snap horizontal — mantendo o gate de lead e o botão de download.

---

### 4.9 TRABALHE CONOSCO `/trabalhe-conosco`

**Hero** (roxo, `pt-40 pb-32`, centralizado, com dois blobs laranja/ciano a 10%):
chip `Venha crescer com a gente` (ícone Briefcase); H1 `Trabalhe` / `Conosco` (2ª linha laranja);
sub: `Há mais de 40 anos construindo infâncias felizes. Procuramos pessoas apaixonadas por fazer a diferença — dentro e fora da fábrica.`
Botão laranja `Ver Vagas ⌄` que rola suavemente até a seção de vagas.

**Valores** (branco, `py-24`): eyebrow `Por que a Krenke?` + H2 `Mais que um emprego`.
4 cards (borda 2px cinza → roxa no hover, raio 24px, ícone 56px que fica laranja no hover):

| Ícone | Título | Texto |
|---|---|---|
| Heart | Propósito Real | Fazemos produtos que constroem infâncias. Cada playground que sai da fábrica transforma espaços e vidas. |
| Lightbulb | Inovação Constante | Engenharia, design e criatividade lado a lado. Aqui boas ideias ganham espaço para se tornar realidade. |
| Trophy | Crescimento de Verdade | Empresa em expansão nacional com planos de desenvolvimento para cada membro do time. |
| Users | Time Unido | Cultura colaborativa, respeito e um ambiente onde cada pessoa importa — do chão de fábrica ao comercial. |

**Vagas** (`slate-50`, `py-24`): eyebrow `Oportunidades` + H2 `Vagas em Aberto`.
Card por vaga (branco, raio 16px): título roxo; badges de tipo de contrato coloridos
(CLT azul · PJ roxo · Estágio teal · Freelancer/Temporário índigo · Banco de Talentos laranja);
meta com departamento, local e contagem de candidaturas; botão `Ver detalhes ⌄` (expande com animação
de altura mostrando Descrição e Requisitos) e botão laranja `Candidatar-se` que rola até o formulário
e pré-seleciona a vaga.
Estado vazio: card tracejado `Nenhuma vaga aberta no momento` + `Mas adoraríamos ter seu currículo no
nosso banco de talentos!` + botão `Enviar Candidatura Espontânea`.

**Formulário** (branco, `py-24`, máx 768px): eyebrow `Candidate-se` + H2 `Envie seu Currículo`
(ou o título da vaga selecionada, com badges e link `Limpar seleção`).
Campos: Nome · E-mail · Telefone · Cidade · Estado · Tipo de candidatura · Experiência · Formação ·
Pretensão salarial · Motivação · Mensagem · **upload de currículo (PDF/DOC)** · captcha.
Após enviar, vai para `/obrigado-curriculo`.

---

### 4.10 LANDING PAGES `/lp` e `/lp-animada` (sem navbar/footer padrão)

Linguagem visual distinta: estilo **"blocos de montar"** — cantos `1.75rem`–`2rem`, **bordas grossas
de 4px** na cor do card, **sombras duras** (`7px 7px 0 {cor}40`; CTA `5px 5px 0 rgba(49,39,131,0.9)`;
imagens grandes `10px 10px 0 rgba(49,39,131,0.15)`), chips e cards levemente **rotacionados (±1–3°)**
como adesivos. Fonte display **Baloo 2**.

**Estrutura comum:** header enxuto com âncoras → hero com formulário → linhas de produto →
galeria em marquee infinito (pausa no hover, desliga em `prefers-reduced-motion`) →
benefícios (auto-rotativos a cada 3,5s) → credenciais → depoimentos → formulário final → rodapé `#241d61`.

**Exclusivo da `/lp-animada` — AssemblyScroll (peça central):**
seção sticky de **400vh** onde um canvas desenha uma sequência de **26 frames** de um playground
sendo montado, o índice do frame amarrado ao progresso de scroll. Fundo `#f2f2f2` (casa com os frames),
crop de 7% na base (marca d'água). Cover em paisagem, contain em retrato.
Três capítulos com cores próprias (laranja → ciano → verde), cada um com legenda em cartão branco
de borda colorida que cruza o fade. Barra de progresso laranja. CTA clímax no fim da narrativa.
→ No Framer: usar **Scroll Section com sticky + sequência de imagens** ou um code component com canvas.

**Regras da LP:** um único componente de CTA para toda a página (nunca variar por seção);
máximo **1 CTA primário por viewport**; ícones SVG (nunca emoji); nada de sombras difusas genéricas
nos blocos — sempre sombra dura.

---

### 4.11 THANK-YOU `/obrigado` e `/obrigado-curriculo`

Página cheia, fundo roxo ou branco, sem navbar. Ícone de sucesso animado (confete opcional),
título grande, mensagem de próximo passo, botões `Voltar para a Home` e `Ver Produtos`.
Devem disparar o evento de conversão do GTM.

---

## 5. CMS (Framer CMS Collections)

| Collection | Campos |
|---|---|
| **Produtos** | `id/código` (texto, ex. `KMP 0502`), `nome`, `slug`, `categoria` (referência), `imagem principal`, `galeria` (múltiplas imagens), `descrição` (texto), `especificações` (rich text — tabela) |
| **Categorias** | `nome`, `slug`, `subtítulo`, `descrição`, `cor` (hex), `imagem de destaque`, `ordem` |
| **Posts** | `título`, `slug`, `excerpt`, `conteúdo` (rich text), `imagem de capa`, `autor`, `data`, `publicado` (boolean) |
| **Vagas** | `título`, `tipos de contrato` (multi), `departamento`, `local`, `descrição`, `requisitos`, `ativa` (boolean) |
| **Projetos** | `título`, `local`, `youtube_id`, `thumbnail`, `cor de acento` |
| **Downloads** | `título`, `descrição`, `arquivo`, `tamanho`, `tipo`, `ícone`, `cor de acento` |

Regras de CMS:
- Página de produto = template dinâmico ligado à collection Produtos (no site atual é um modal;
  no Framer, **melhor virar página real** `/produtos/{slug}` — ganha SEO e link compartilhável).
- Página de categoria = template dinâmico ligado a Categorias.
- Post = template dinâmico ligado a Posts.

---

## 6. ESPECIFICAÇÃO DE MOVIMENTO (equivalências GSAP → Framer)

| Efeito no site atual | Como fazer no Framer |
|---|---|
| **SplitHeadline** — título revelado por caractere/palavra, cada pedaço subindo 100% de dentro de uma máscara, `expo.out`, 1s, stagger 0.02 (chars) / 0.06 (words) | Text com Appear effect de linha/palavra, ou componente com variantes + delay incremental. Máscara = `overflow: hidden` no wrapper de cada linha |
| **Reveal** — fade + deslocamento de 48px (up/down/left/right) ou `scale 0.92`, `power3.out`, 0.9s, `start: top 85%`, **once** | Scroll Appear effect com direção, distância e stagger. Marcar "animar apenas uma vez" |
| **Reveal com stagger** — filhos em cascata (0.045–0.12s) | Appear effect no container com stagger nos filhos |
| **Parallax** — deslocamento vertical de ±8%·speed amarrado ao scroll, **só desktop** | Scroll Transform (Y) com range de entrada/saída da viewport; desativar no breakpoint mobile |
| **Counter** — número contando 0 → 100 quando entra na viewport, 2s, `power2.out` | Code component simples ou componente com variantes numeradas |
| **Magnetic** — elemento segue o cursor a 25–35% do deslocamento, `power3`, 0.6s, **só ponteiro fino** | Code override de mouse-follow, ou aceitar hover `scale 1.05` como fallback |
| **Barras de stat** — `scaleX 0 → 1` com scrub conforme a seção cruza a viewport, stagger 0.08 | Scroll Transform em `scaleX` com `transform-origin: left` |
| **Trilho horizontal pinado** (CategoryPreview) | Section com `position: sticky` + Scroll Transform em X do trilho |
| **Hover coreografado do ShowcaseCard** — 7 propriedades numa timeline de 0.45s, reversível | Componente com variantes `default` / `hover`, transição `cubic-bezier(0.16,1,0.3,1)` 0.45s. Aplicar também em `focus-visible` |
| **Gradiente animado do H1** | Background gradient + Loop de `background-position` (15s, linear, infinito) |
| **Transição entre páginas** | Fade de 0.45s **só em opacidade** (nunca transform/filter no wrapper — quebra `position: fixed` de modais) |

**Regra de ouro do motion:**
- Animar **apenas** `transform` e `opacity`. Nunca `width`, `height`, `top`, `left`.
- **Respeitar `prefers-reduced-motion`**: com movimento reduzido, tudo entra já posicionado
  (barras em 100%, títulos visíveis, marquee parado, parallax desligado).
- Entradas: 0.7–1.0s. Micro-interações: 150–300ms. Loops de fundo: 3–30s.

---

## 7. RESPONSIVIDADE

Breakpoints do Framer: **Desktop 1200 · Tablet 810 · Phone 390** (mapear a partir dos breakpoints
originais `sm 640 · md 768 · lg 1024 · xl 1280`).

Regras:
- `max-width` do container: 1280px; padding lateral 16 / 24 / 32px.
- H1: 40px (phone) → 60px (tablet) → 96px (desktop).
- Grids: 3 colunas → 2 → 1.
- Menu desktop só a partir de 1024px; abaixo, drawer.
- Trilho pinado da Home: **só desktop**; abaixo vira carrossel com snap.
- Parallax e efeito magnético: **desligados** abaixo de 1024px.
- Alvos de toque ≥ **44×44px** em tudo que é clicável.
- `overflow-x` da página: **clip**, nunca `hidden` (`hidden` cria scroll container e quebra
  todo `position: sticky` descendente — este bug já aconteceu no site original).

---

## 8. SEO, META E ANALYTICS

Por página, configurar título, descrição e OG image:

| Rota | Title | Description |
|---|---|---|
| `/` | Krenke Brinquedos \| Fábrica de Playgrounds e Parques Infantis Certificados | Líder nacional na fabricação de playgrounds, parques infantis e brinquedos pedagógicos certificados pela ABNT. Qualidade, segurança e inovação para seu espaço de lazer. |
| `/empresa` | Nossa Trajetória \| Krenke Brinquedos - Fábrica de Playgrounds | Conheça a história da Krenke Brinquedos, líder na fabricação de playgrounds desde 1987. Excelência, segurança e presença nacional. |
| `/produtos` | Playgrounds e Parques Infantis \| Fábrica Krenke | Explore nossa linha completa. Qualidade e segurança em playgrounds certificados para escolas, condomínios e praças. |
| `/produtos/categoria/:slug` | {Categoria} \| Catálogo Krenke | Explore nossa linha de {Categoria}. Qualidade e segurança em playgrounds certificados. |
| `/produtos/{slug}` | {Produto} \| Playground Krenke Certificado | Conheça o {Produto} da Krenke. Um playground robusto, seguro e certificado pela ABNT para condomínios e escolas. |
| `/trabalhe-conosco` | Trabalhe Conosco — Krenke Brinquedos Pedagógicos | Faça parte do time Krenke! Vagas CLT, PJ, Estágio e Banco de Talentos em Guaramirim/SC e Palmares/PE. |
| `/orcamento` | Solicite seu Orçamento \| Krenke Brinquedos | Receba uma proposta detalhada de playgrounds e parques infantis certificados. |

**Structured data (JSON-LD) a incluir:**
- `Organization` + `LocalBusiness` no site inteiro (nome, logo, endereço completo, telefone
  `+554733730693`, geo `-26.4714 / -49.0026`, horário Seg–Sex 08:00–18:00, `sameAs` das redes).
- `Product` em cada página de produto (nome, imagem, descrição, brand Krenke, sku, offer BRL, InStock).
- `BreadcrumbList` nas páginas internas.
- `BlogPosting` nos posts.

**Analytics/integrações:** Google Tag Manager (container `GTM-MVZ7JB2F`), evento `pageview` em cada
mudança de rota, captura e persistência de **UTMs** (`utm_source`, `utm_medium`, `utm_campaign`,
`utm_term`, `utm_content`) para envio junto com os leads.
Gerar `sitemap.xml` e `robots.txt`. Idioma do documento: **`pt-BR`**.

---

## 9. MELHORIAS OBRIGATÓRIAS (o site atual tem estes problemas — corrigir na versão Framer)

Baseline atual medido: **Mobile — Perf 49 · A11y 84 · Práticas 73 · SEO 100** (LCP 14,0s, FCP 7,8s).
**Desktop — Perf 56 · A11y 84 · Práticas 73 · SEO 100** (LCP 3,0s, TBT 500ms, payload total 6,7 MB).

### 9.1 Performance (prioridade máxima)
1. **Widget do Instagram** — hoje carrega ~10 imagens direto do CDN do Instagram, 270–480 KB cada,
   **> 3,3 MB**, cache de 14 dias. Substituir por **thumbnails estáticas otimizadas** (WebP, ~200px,
   hospedadas no Framer) em grid, com lazy-load. Maior ganho isolado de todo o site.
2. **Vídeo do hero** — iframe do YouTube autoplay (~978 KB, 857ms de main thread) carregado no boot.
   Carregar só após o `load` + idle, com fade-in; usar `youtube-nocookie.com`. Poster estático até lá.
3. **Imagens superdimensionadas** — imagem "Menino-Home" em 1414×1558 exibida a 544×769;
   imagens de produto em 2000×2000 exibidas a 243×243. Usar as ferramentas de imagem responsiva do
   Framer (srcset automático) e limitar os originais a ~1200px no maior lado.
4. **Fonte** — hoje são 7 pesos estáticos + itálico de Google Fonts, render-blocking, e o peso 300
   nunca é usado. Trocar por **Nunito variável self-hosted** (~40 KB), `font-display: swap`, com preload.
5. **JS/CSS não usados** — 796 KB de JS e 242 KB de CSS ociosos. No Framer isso melhora sozinho;
   ainda assim, evitar code components pesados e não embutir bibliotecas grandes na home.
6. **Cache** — assets estáticos com `max-age=31536000, immutable`.
7. **Bug de tradução (crítico no original):** o detector de idioma pega `pt-BR` do `<html lang>`,
   mas a comparação era com `'pt'` estrito → dispara **~161 requisições de tradução pt→pt-BR em toda
   primeira visita**. No Framer, usar as páginas de localização nativas (pt/en/es) — **nunca**
   tradução automática em runtime.

### 9.2 Acessibilidade (84 → meta 95+)
1. **Nomes acessíveis** em todos os botões só-ícone: hambúrguer (`aria-expanded` incluso), fechar
   drawer, fechar modal, setas do carrossel, thumbnails da galeria, botões sociais, FAB de contato.
2. **Links idênticos com destinos diferentes:** os 6 botões "Ver Produtos" dos ShowcaseCards precisam
   de rótulo único (`Ver produtos: {Categoria}`).
3. **Hierarquia de headings:** hoje há `h3` onde deveria haver `h2` (Features, Stats, Instagram, Blog)
   e `h4` no rodapé. Corrigir a semântica sem mudar o visual — **um `h1` por página**.
4. **Contraste (correções visíveis, já aprovadas):**
   - Coluna "Mercado Comum" da tabela: `#94A3B8` → `#475569`
   - Texto do botão "Ver Produtos": escurecer conforme a cor da categoria (laranja `#F39200` reprova
     4.5:1 em texto pequeno)
   - Rodapé: `text-gray-500`/`gray-400` sobre roxo → `white/85`; divisores `white/20` → `white/60`
   - Subtítulo do ShowcaseCard: `white/70` → `white/90`
5. **Foco visível** em todos os elementos interativos (anel laranja de 2px com offset).
6. **Estados de hover replicados em `focus-visible`** (o hover coreografado dos cards já faz isso).
7. **Respeitar `prefers-reduced-motion`** em todas as animações (§6).
8. Formulários: labels visíveis ligados aos campos, `autocomplete` correto, `type` semântico
   (`tel`, `email`) para o teclado certo no mobile, erros com `role="alert"`.

### 9.3 Melhorias de UX/produto (recomendadas)
1. **Produto = página real** (`/produtos/{slug}`) em vez de modal por query param — SEO, link
   compartilhável, botão voltar funcionando. Manter o modal como atalho a partir do grid, se quiser.
2. **Filtros de produto no mobile:** hoje a sidebar some e sobra só um chip informativo.
   Adicionar bottom-sheet de filtros.
3. **Carrossel da home:** pausar autoplay no hover e no foco; adicionar dots de navegação e
   controles acessíveis por teclado.
4. **Downloads:** 3 dos 4 recursos não têm arquivo vinculado (só o catálogo tem `link`). Vincular
   todos ou remover os que não existem. O botão "Solicitar Suporte Técnico" não faz nada — linkar.
5. **Estado de carregamento:** trocar o texto "Carregando..." por skeletons (o blog já faz certo).
6. **Breadcrumbs** nas páginas internas (produtos, categoria, produto, post).
7. **Consistência de heros:** hoje `/empresa`, `/produtos`, `/orcamento`, `/projetos`, `/downloads`
   e `/blog` repetem o mesmo hero com pequenas variações de altura e de animação
   (uns usam GSAP, outros framer-motion). No Framer, criar **um componente único de Hero** com
   props: `altura`, `chip`, `título linha 1`, `título linha 2`, `subtítulo`, `mostrar traço`, `textura`.
8. **Carrinho de orçamento:** adicionar toast de confirmação ao adicionar item e permitir editar
   quantidade.
9. **404 real** — hoje qualquer rota inválida cai silenciosamente na Home. Criar página 404 de verdade.
10. **Blog:** adicionar categorias/tags reais (hoje todo card mostra o badge fixo "Novidades") e
    tempo de leitura calculado (hoje é "5 min" hardcoded em todos).

---

## 10. FORMULÁRIOS E INTEGRAÇÕES NO FRAMER

Três formulários a construir (Framer Forms + webhook):

| Form | Onde | Campos | Destino |
|---|---|---|---|
| **Orçamento** | `/orcamento` | §4.4 | Webhook → CRM; redireciona para `/obrigado` |
| **Catálogo (gate)** | `/catalogo` | Nome, E-mail, WhatsApp, Cidade | Webhook → CRM; libera o PDF |
| **Candidatura** | `/trabalhe-conosco` | §4.9 + upload de CV | Webhook → RH; redireciona para `/obrigado-curriculo` |
| **WhatsApp rápido** | FAB global | Nome, telefone, mensagem | Redireciona para `wa.me/554733730693` |

Em todos: **honeypot** oculto, validação client-side com mensagens em pt-BR, estados de
enviando/erro/sucesso, e envio dos UTMs armazenados junto com o payload.
Proteção anti-bot: captcha invisível (Cloudflare Turnstile ou equivalente do Framer).

---

## 11. CHECKLIST DE ACEITE

**Fidelidade visual**
- [ ] Paleta, tipografia, raios e sombras batem com os tokens da §1
- [ ] Todas as 17 rotas públicas existem e navegam corretamente
- [ ] Toda a copy da §4 está literal, em pt-BR, com acentuação correta
- [ ] Navbar muda de estado no scroll (padding, fundo, altura do logo, colapso da top bar)
- [ ] Dropdown de Produtos, drawer mobile arrastável e seletor de idioma funcionando
- [ ] Barra de progresso de scroll no topo com o gradiente correto
- [ ] Mapa aparece **só** na Home, com o efeito grayscale → cor no hover
- [ ] FAB de contato com speed-dial de 2 opções

**Movimento**
- [ ] Timeline de entrada do hero na ordem e nos tempos da §4.1.1
- [ ] Títulos com reveal por palavra/caractere e máscara
- [ ] Trilho horizontal pinado no desktop e carrossel com snap no mobile
- [ ] Barras de stat e contadores animando por scroll
- [ ] Hover coreografado dos ShowcaseCards (7 propriedades, reversível, também no foco)
- [ ] `prefers-reduced-motion` desliga tudo corretamente

**Funcional**
- [ ] Filtro de produtos por categoria via URL
- [ ] Carrinho de orçamento persistente que pré-preenche o formulário
- [ ] Todos os formulários validam, enviam e redirecionam
- [ ] Gate de lead do catálogo persiste o acesso
- [ ] Modal de vídeo dos projetos abre e fecha

**Qualidade (metas)**
- [ ] Lighthouse mobile: Performance **≥ 80**, Acessibilidade **≥ 95**, Práticas **≥ 95**, SEO **100**
- [ ] LCP < 2,5s · CLS < 0,1 · INP < 200ms
- [ ] Payload total da Home **< 2 MB** (hoje: 6,7 MB)
- [ ] Zero scroll horizontal em qualquer breakpoint
- [ ] Navegação completa por teclado com foco visível
- [ ] Um `h1` por página e hierarquia de headings sem saltos

---

## 12. O QUE **NÃO** REPLICAR

- Painel admin (`/pgadmin`), área do revendedor, calculadora de orçamento do revendedor,
  relatórios PowerBI, marketing, autenticação e controle de papéis.
- Sistema de tradução automática em runtime (usar localização nativa do Framer, se necessária).
- `SecurityGuard`, injetor de scripts dinâmicos do banco e integrações internas (Goalfy, n8n,
  Supabase, R2) — substituir por webhooks simples.
