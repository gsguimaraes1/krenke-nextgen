-- ─────────────────────────────────────────────────────────────
-- associated_resellers — lista manual de revendas p/ o campo
-- "Revendedor Associado" na calculadora do revendedor.
--
-- Nome cadastrado manualmente por enquanto (sem vínculo com login) até
-- automatizar a associação revenda <-> conta de usuário.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.associated_resellers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.associated_resellers enable row level security;

-- Qualquer usuário autenticado pode ler a lista (dropdown da calculadora).
drop policy if exists associated_resellers_select on public.associated_resellers;
create policy associated_resellers_select on public.associated_resellers
  for select to authenticated
  using (true);

-- Cadastro (insert) restrito a um allowlist fixo de contas + `super`.
-- Mesmo padrão hardcoded usado em api/report-url.js / App.tsx (/relatorio).
drop policy if exists associated_resellers_insert on public.associated_resellers;
create policy associated_resellers_insert on public.associated_resellers
  for insert to authenticated
  with check (
    public.is_super_admin()
    or auth.uid() = any (array[
      'ff315d16-e719-485e-8d2f-20df219666c5',
      '1757670c-5ab0-4642-82b3-9acdbfa14701',
      '40bfce8e-fe27-44e2-bda3-cf6273fc6fea',
      'd19952b5-151c-4943-bf74-1a07b199ba75'
    ]::uuid[])
  );

-- Correção de cadastro (typo etc.) fica só com `super`.
drop policy if exists associated_resellers_update on public.associated_resellers;
create policy associated_resellers_update on public.associated_resellers
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists associated_resellers_delete on public.associated_resellers;
create policy associated_resellers_delete on public.associated_resellers
  for delete to authenticated
  using (public.is_super_admin());

-- Snapshot do nome da revenda no orçamento salvo (mesmo padrão de reseller_name).
alter table public.orcamento_revendas
  add column if not exists associated_reseller_name text;
