-- ─────────────────────────────────────────────────────────────
-- orcamento_revendas — log de orçamentos da calculadora do revendedor
--
-- IMPORTANTE: esta tabela NÃO armazena imagens. As imagens do parque
-- seguem sendo apenas anexos locais da sessão, usados na geração do PDF
-- e descartados ao recarregar. A coluna `items` guarda somente dados
-- textuais/numéricos dos produtos do orçamento.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.orcamento_revendas (
  id                   uuid primary key default gen_random_uuid(),

  -- Identificação do orçamento
  quote_number         text not null unique,
  user_id              uuid not null references auth.users(id) on delete cascade,
  reseller_name        text,                    -- snapshot do nome na hora do salvamento

  -- Dados do orçamento
  model_name           text,
  client_name          text,
  client_cnpj          text,
  client_number        text,
  margin               numeric(6,2) not null default 0,

  -- Itens: [{ code, description, unit_price, qty }] — sem imagens
  items                jsonb not null default '[]'::jsonb,

  -- Totais congelados no momento do salvamento
  total_bruto          numeric(14,2) not null default 0,
  total_ipi            numeric(14,2) not null default 0,
  total_com_ipi        numeric(14,2) not null default 0,

  -- Observações
  use_full_disclaimer  boolean not null default false,
  disclaimer_text      text,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists orcamento_revendas_user_id_idx
  on public.orcamento_revendas (user_id);
create index if not exists orcamento_revendas_created_at_idx
  on public.orcamento_revendas (created_at desc);

-- updated_at automático
create or replace function public.set_orcamento_revendas_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orcamento_revendas_set_updated_at on public.orcamento_revendas;
create trigger orcamento_revendas_set_updated_at
  before update on public.orcamento_revendas
  for each row execute function public.set_orcamento_revendas_updated_at();

-- ── RLS: revendedor só enxerga os próprios; role `super` enxerga tudo ──
alter table public.orcamento_revendas enable row level security;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'super'
  );
$$;

drop policy if exists orcamento_revendas_select on public.orcamento_revendas;
create policy orcamento_revendas_select on public.orcamento_revendas
  for select to authenticated
  using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists orcamento_revendas_insert on public.orcamento_revendas;
create policy orcamento_revendas_insert on public.orcamento_revendas
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists orcamento_revendas_update on public.orcamento_revendas;
create policy orcamento_revendas_update on public.orcamento_revendas
  for update to authenticated
  using (user_id = auth.uid() or public.is_super_admin())
  with check (user_id = auth.uid() or public.is_super_admin());

drop policy if exists orcamento_revendas_delete on public.orcamento_revendas;
create policy orcamento_revendas_delete on public.orcamento_revendas
  for delete to authenticated
  using (user_id = auth.uid() or public.is_super_admin());
