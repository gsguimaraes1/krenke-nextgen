-- Campo "Margem" da calculadora ganhou 2 modos: 'venda' (margem sobre o
-- preço de venda, fórmula original, capada em 99% pra não divergir) e
-- 'markup' (markup sobre o custo, sem teto matemático — pra revendedor que
-- pensa em "200%" como multiplicador de custo, não margem sobre venda).
-- Rodar manualmente no SQL Editor do projeto Krenke (rkimlgpwshntyzaoqxpb) —
-- MCP Supabase desta sessão aponta pra outro projeto.
alter table public.orcamento_revendas
  add column if not exists margin_mode text not null default 'venda'
  check (margin_mode in ('venda', 'markup'));
