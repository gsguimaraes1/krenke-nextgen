# design.md — Sistema de Design (LP Animada)

Guia visual da landing page `/lp-animada` ([pages/LpAnimada.tsx](pages/LpAnimada.tsx)).
Serve de referência para evoluir a LP e replicar a linguagem em outras páginas de campanha.

Direção gerada com a skill `ui-ux-pro-max`: estilo **Vibrant & Block-based** + padrão
**Scroll-Triggered Storytelling**, adaptados à identidade Krenke.

## Conceito

Marca de playground = lúdico, colorido, seguro. A linguagem traduz isso em:

- **Blocos**: cantos bem arredondados (`rounded-[1.75rem]` a `rounded-[2rem]`), bordas grossas
  de 4px nas cores da marca — remete a peças de montar.
- **Adesivos**: chips de seção rotacionados (±2°), cartões levemente girados, sombras duras.
- **Storytelling por scroll**: a seção de montagem é o capítulo central; cada etapa tem uma
  cor própria (laranja → ciano → verde) e o CTA clímax aparece no final da narrativa.

## Paleta (cores oficiais do logo)

| Papel | Nome | Hex | Uso |
|-------|------|-----|-----|
| Primária | Roxo Krenke | `#312783` | Fundos de seção, títulos, sombras duras |
| CTA / Destaque | Laranja | `#F39200` | Botões, spans de destaque, foco de inputs |
| Apoio 1 | Ciano | `#009FE3` | Chips, capítulo 2 da montagem, cards |
| Apoio 2 | Verde | `#008D36` | Capítulo 3 ("pronto"), chips |
| Apoio 3 | Magenta | `#7F2082` | Cards de produto, chips |
| Apoio 4 | Rosa | `#E6007E` | Chips de destaque ("Role para montar") |
| Fundo claro | — | `#f2f2f2` | Seção da animação (casa com o fundo dos frames) |
| Fundo escuro footer | — | `#241d61` | Rodapé (tom mais fundo que o roxo primário) |

Regras:
- Máx. 4–6 cores vibrantes por viewport; roxo e laranja dominam, as demais pontuam.
- Texto corpo: `gray-700` sobre claro, `white/85+` sobre roxo. Nunca cinza sobre cinza.
- Laranja `#F39200` sobre branco só em texto grande/bold (contraste limítrofe).

## Tipografia

| Papel | Fonte | Pesos | Classe |
|-------|-------|-------|--------|
| Display / títulos | **Baloo 2** (Google Fonts) | 600–800 | `font-baloo` ([index.css](index.css)) |
| Corpo / UI | **Nunito** (fonte global do site) | 400–900 | padrão |

- Títulos de seção: `text-3xl md:text-5xl`, sem caixa alta forçada (Baloo já é expressiva).
- Chips/labels: `text-xs font-black uppercase tracking-widest`.
- Carregamento: `<link>` no Helmet da LP (preconnect + css2). CSP hoje é Report-Only;
  ao ativar enforcement, incluir `fonts.googleapis.com` e `fonts.gstatic.com` na allowlist.

## Tokens de forma e sombra

| Token | Valor | Uso |
|-------|-------|-----|
| Raio de cartão | `rounded-[1.75rem]` / `rounded-[2rem]` | Cards, form, imagens |
| Raio de controle | `rounded-xl` (inputs), `rounded-full` (botões/chips) | UI |
| Borda de bloco | `border-4` na cor do card | Cards de produto, form, legendas |
| Sombra dura padrão | `7px 7px 0 <cor>40` | Cards (cor do próprio card a 25%) |
| Sombra dura CTA | `5px 5px 0 rgba(49,39,131,0.9)` | Botões (roxo quase sólido) |
| Sombra dura hero img | `10px 10px 0 rgba(49,39,131,0.15)` | Imagens grandes |
| Rotação adesivo | `rotate(±1–3deg)` | Chips, legendas, cards alternados |

## Componentes (definidos em LpAnimada.tsx)

- **`CtaButton`** — botão único de conversão: laranja, `font-baloo`, sombra dura roxa,
  hover desloca (-0.5px) e aumenta a sombra, active "afunda", `focus-visible` outline roxo.
  Todos os CTAs da página usam este componente; nunca criar variação por seção.
- **`SectionChip`** — rótulo adesivo de seção (`color` + `rotate` configuráveis). Toda
  seção começa com um chip + título Baloo com span laranja.
- **`AssemblyScroll`** — seção sticky de 400vh: canvas desenha os 26 frames de
  [assets/lp-animada/](assets/lp-animada/) conforme `scrollYProgress` (framer-motion).
  Crop de 7% no rodapé do frame (marca d'água). Cover em paisagem, contain em retrato.
  Legendas = cartões brancos com borda na cor do capítulo. Barra de progresso laranja.
- **`GalleryMarquee`** — galeria em marquee CSS infinito (`.lp-marquee` em index.css),
  pausa no hover, desliga com `prefers-reduced-motion`.

## Motion

- Micro-interações: 150–300ms, `ease-out` na entrada.
- Entradas de seção: `whileInView` fade+slide (20–30px), `viewport={{ once: true }}`,
  stagger de ~80ms entre cards.
- Elementos flutuantes do hero: `animate-float` (token global, 6s) com `animationDelay`
  escalonado.
- Nunca animar `width/height/top/left`; só `transform`/`opacity`.
- Scroll-scrub do canvas é dirigido pelo usuário (interrompível por natureza).

## Acessibilidade (checklist aplicado)

- Labels visíveis ligados por `htmlFor`; erro de form com `role="alert"`.
- `autocomplete` + `type` semântico (`tel`, `email`) → teclado certo no mobile.
- `aria-label` em botões só-ícone (menu, thumbs); estrelas com label textual.
- `cursor-pointer` em tudo clicável; `focus-visible` visível no CTA.
- `prefers-reduced-motion` respeitado no marquee.
- Alvos de toque ≥44px (botões `py-2.5+`, thumbs 92px).

## Gotcha estrutural

`position: sticky` (header, AssemblyScroll) depende de **não** haver `overflow-x: hidden`
em ancestrais. [index.css](index.css) usa `overflow-x: clip` em `html/body/#root` por isso —
**não reverter para `hidden`**, quebra todos os sticky do site.

## Anti-padrões (evitar)

- Cores dessaturadas / tons pastéis — a marca pede energia.
- Sombras difusas genéricas (`shadow-lg`) nos blocos — usar sombra dura.
- Botões com estilo próprio por seção — sempre `CtaButton`.
- Emoji como ícone — usar Lucide (SVG).
- Mais de um CTA primário por viewport.
