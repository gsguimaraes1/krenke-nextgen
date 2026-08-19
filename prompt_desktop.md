COMPLEMENTO — VERSÃO DESKTOP (mesmo site: https://site.krenke.com.br)

NOTAS DESKTOP: Desempenho 56/100, Acessibilidade 84/100, Práticas recomendadas 73/100, SEO 100/100.
Métricas de laboratório: FCP 0,8s, LCP 3,0s, TBT 500ms, CLS 0.002, Speed Index 2,3s.
Métricas de campo (usuários reais, 28 dias): Core Web Vitals "aprovado" — LCP 1,5s, INP 119ms, CLS 0,02.

Pontos adicionais/diferentes do relatório mobile:

1. WIDGET DO INSTAGRAM É O MAIOR PROBLEMA NO DESKTOP
- Um widget (aparentemente via snapwidget.com) carrega ~10 imagens diretamente do Instagram 
  (scontent.cdninstagram.com), cada uma entre 270 KB e 480 KB, totalizando mais de 3,3 MB, 
  com cache de apenas 14 dias.
- Isso sozinho explica a maior parte dos "554 KiB de economia estimada em imagens" e dos 
  "327 KiB de economia estimada em cache" apontados pelo relatório.
- Sugestão: não carregar essas imagens em tamanho original — usar uma versão com miniaturas 
  otimizadas (o próprio Instagram/embed costuma ter parâmetros de tamanho), fazer lazy-load 
  do widget somente quando estiver próximo da viewport, ou trocar por uma versão estática 
  (thumbnails hospedadas no seu próprio servidor, atualizadas periodicamente).
- Considerar também usar <link rel="preconnect"> para snapwidget.com se o widget for mantido 
  (economia estimada de LCP: 110ms), mas o ideal é reduzir o payload das imagens.

2. IMAGEM DE HERO/BANNER SUPERDIMENSIONADA
- A imagem "Fábrica Krenke" (Menino-Home-krenke-*.webp) está em 1414x1558px mas é exibida em 
  544x769px — sozinha responde por ~148 KB de economia estimada. Gerar um tamanho responsivo 
  adequado (srcset) para desktop.
- Mesmo padrão das imagens de produtos (2000x2000px exibidas em 243x243px) já identificado no 
  mobile se repete aqui, com um pouco mais de peso por serem mais imagens carregadas na versão 
  desktop da página.

3. PAYLOAD TOTAL MUITO GRANDE
- "Evite payloads de rede muito grandes": tamanho total de 6.744 KiB (~6,7 MB) — bem acima do 
  recomendado. Grande parte vem do widget do Instagram e das imagens de produto não otimizadas.

4. JAVASCRIPT/CSS (mesma tendência do mobile, valores um pouco menores por causa do hardware 
   mais rápido simulado)
- Reduza JavaScript não usado: economia estimada de 796 KiB.
- Reduza CSS não usado: economia estimada de 242 KiB.
- Tempo de execução de JS: 1,7s / Trabalho da thread principal: 3,3s / 11 tarefas longas.

5. ACESSIBILIDADE E PRÁTICAS RECOMENDADAS
- Mesmos problemas do relatório mobile (nota 84 e 73): botões sem nome acessível, links sem 
  nome compreensível, contraste insuficiente, hierarquia de headings fora de ordem, links 
  idênticos com mesmo destino.

PRIORIDADE SUGERIDA PARA DESKTOP: 
1º) Resolver o widget do Instagram (maior impacto isolado); 
2º) Otimizar/redimensionar imagens de produto e do hero; 
3º) Reduzir JS/CSS não utilizados; 
4º) Corrigir itens de acessibilidade (nomes de botões/links, contraste, hierarquia de headings).