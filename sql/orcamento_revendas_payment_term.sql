-- ─────────────────────────────────────────────────────────────
-- orcamento_revendas — coluna payment_term (forma de pagamento)
--
-- Calculadora do revendedor ganhou 2 botões de forma de pagamento:
-- "À Vista" (5% de desconto sobre o total bruto, IPI integral) e
-- "Entrada + 28 Dias" (valor cheio + IPI, comportamento anterior).
-- Congelado no momento do salvamento, junto com os totais.
-- ─────────────────────────────────────────────────────────────

alter table public.orcamento_revendas
  add column if not exists payment_term text not null default 'entrada'
    check (payment_term in ('avista', 'entrada'));
