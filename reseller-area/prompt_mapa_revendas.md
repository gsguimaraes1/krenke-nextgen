# Prompt: Mapa Interativo de Revendas Krenke

Cole este prompt no seu agente de código (Claude Code, Cursor, etc.) dentro do repositório do site Krenke NextGen.

---

## Contexto

Este é um projeto Next.js/React Router. Preciso criar um componente de **mapa interativo do Brasil** para a página de "onde encontrar" / revendas do site, no mesmo estilo visual de referência: mapa escuro (navy), estados sem contorno chamativo, círculos laranja sobre cada estado mostrando a quantidade de revendas, e o estado de Santa Catarina (sede da empresa) destacado com um contorno branco/dourado.

## Dados

O arquivo `revendas_krenke.json` (anexo/na raiz do projeto em `/data`) tem essa estrutura:

```json
{
  "total_revendas": 285,
  "por_estado": [
    { "UF": "SP", "ESTADO": "SAO PAULO", "count": 80 },
    { "UF": "SC", "ESTADO": "SANTA CATARINA", "count": 25 }
  ],
  "revendas": [
    { "nome": "BILO BRINQUEDOS", "segmento": "REVENDEDOR PRIVADO", "cidade": "CAXIAS DO SUL", "uf": "RS", "ibge": "4305108" }
  ]
}
```

- `por_estado`: contagem agregada por UF — use isso pros círculos do mapa (MVP)
- `revendas`: lista individual de cada revenda com cidade e código IBGE do município — guarde isso pra uma fase futura de pins por cidade (vou refinar o filtro depois, por enquanto não precisa usar)

## O que construir

1. **Componente `RevendasMap.tsx`** usando `react-simple-maps` (+ `d3-geo`)
   - `npm install react-simple-maps d3-geo`
   - Tipos: `npm install -D @types/react-simple-maps` se for TypeScript
2. **GeoJSON dos estados do Brasil**: baixe e salve localmente em `/public/geo/brazil-states.json` (não referenciar CDN externo em produção). Fonte confiável: repositório `codeforgermany/click_that_hood` (dataset `brazil-states`) ou o shapefile de UFs do IBGE convertido pra GeoJSON.
3. **Renderização**:
   - `<ComposableMap projection="geoMercator">` com os estados em fill escuro (`#1e2a4a` ou cor da paleta do site) e stroke quase invisível
   - Um `<Marker>` por estado, posicionado no centroide geográfico (calcule com `d3-geo`'s `geoCentroid()` a partir do próprio GeoJSON, não hardcode — assim fica mais fácil de manter)
   - Círculo laranja (`#f5a623` ou cor da marca) com o número de revendas centralizado dentro, raio proporcional ao `count` (ex: `raio = 12 + Math.sqrt(count) * 2`)
   - Estado de **SC destacado**: stroke branco mais grosso no `<Geography>` correspondente e um leve glow/highlight no marker
4. **Interatividade**:
   - Hover no círculo mostra tooltip com nome do estado + quantidade (pode usar um `<div>` posicionado via state React, ou lib tipo `react-tooltip`)
   - Click no círculo pode expandir uma lista lateral com as revendas daquele estado (usando o array `revendas` filtrado por `uf`) — deixe a estrutura pronta pra isso mesmo que a versão inicial só mostre a contagem
5. **Responsividade**: o mapa precisa funcionar em mobile — use `viewBox` do SVG e container com `max-width`, sem larguras fixas em px
6. **Performance**: como o GeoJSON de estados é leve (só 27 features), não precisa de lazy loading, mas carregue os dados de `revendas_krenke.json` via `import` estático ou fetch em build-time (getStaticProps/loader), não em client-side fetch

## Estilo visual

Seguir a paleta de cores já usada no site Krenke NextGen (dark navy + laranja da marca). Título da seção, subtítulo com o total de revendas (`total_revendas`), e o mapa centralizado.

## Entregável

Componente pronto para importar em uma página existente do site, com os dados de `revendas_krenke.json` já integrados e funcionando com os 24 estados presentes no dataset atual.
