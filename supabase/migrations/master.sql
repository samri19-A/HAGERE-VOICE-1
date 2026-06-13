-- ============================================================
-- HAGERE VOICE — Master Schema (safe to run multiple times)
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- STEP 1: Drop old triggers on auth.users (wrapped — may fail
--         on some Supabase plans, that's fine)
-- ============================================================
do $$ begin
  drop trigger if exists on_auth_user_created on auth.users;
exception when others then null;
end $$;

-- ============================================================
-- STEP 2: Drop old functions
-- ============================================================
-- Drop all overloads of apply_voice_command (old migrations created different signatures)
drop function if exists public.apply_voice_command(uuid, text, text, text, integer) cascade;
drop function if exists public.apply_voice_command(text, text, text, integer, uuid) cascade;
drop function if exists public.apply_voice_command(text, text, text, integer)       cascade;
drop function if exists public.undo_last_command()   cascade;
drop function if exists public.my_shop_id()          cascade;
drop function if exists public.handle_new_user()     cascade;
drop function if exists public.set_updated_at()      cascade;

-- ============================================================
-- STEP 3: Drop old tables (cascade removes all policies/triggers)
-- ============================================================
drop table if exists public.voice_commands  cascade;
drop table if exists public.inventory_items cascade;
drop table if exists public.shops           cascade;

-- ============================================================
-- 1. SHOPS — one shop per user account
-- ============================================================
create table public.shops (
  id            uuid          primary key default uuid_generate_v4(),
  owner_id      uuid          not null references auth.users(id) on delete cascade,
  name          text          not null default 'የእኔ ሱቅ',
  name_en       text,
  phone         text,
  location      text,
  description   text,
  avatar_emoji  text          not null default '🏪',
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now(),
  unique (owner_id)
);

-- ============================================================
-- 2. INVENTORY ITEMS
-- ============================================================
create table public.inventory_items (
  id                  uuid          primary key default uuid_generate_v4(),
  shop_id             uuid          not null references public.shops(id) on delete cascade,
  name_am             text          not null,
  name_en             text,
  quantity            integer       not null default 0 check (quantity >= 0),
  unit                text          not null default 'ቁጥር',
  category            text,
  emoji               text          not null default '📦',
  low_stock_threshold integer       not null default 3 check (low_stock_threshold >= 0),
  price_birr          numeric(10,2) not null default 0 check (price_birr >= 0),
  is_active           boolean       not null default true,
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now(),
  unique (shop_id, name_am)
);

create index idx_inventory_shop     on public.inventory_items (shop_id);
create index idx_inventory_name_am  on public.inventory_items using gin (name_am gin_trgm_ops);
create index idx_inventory_category on public.inventory_items (shop_id, category);

-- ============================================================
-- 3. VOICE COMMANDS — full audit trail
-- ============================================================
create table public.voice_commands (
  id               uuid          primary key default uuid_generate_v4(),
  shop_id          uuid          not null references public.shops(id) on delete cascade,
  item_id          uuid          references public.inventory_items(id) on delete set null,
  raw_transcript   text          not null,
  parsed_action    text          check (parsed_action in ('add', 'subtract', 'set', 'unknown')),
  parsed_item      text,
  parsed_quantity  integer,
  quantity_before  integer,
  quantity_after   integer,
  revenue_birr     numeric(10,2) default 0,
  status           text          not null default 'pending'
                     check (status in ('pending', 'applied', 'failed', 'queued_offline', 'undone')),
  error_message    text,
  created_at       timestamptz   not null default now()
);

create index idx_vc_shop on public.voice_commands (shop_id, created_at desc);
create index idx_vc_item on public.voice_commands (item_id);

-- ============================================================
-- 4. AUTO-UPDATE updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger shops_updated_at
  before update on public.shops
  for each row execute function public.set_updated_at();

create trigger inventory_items_updated_at
  before update on public.inventory_items
  for each row execute function public.set_updated_at();

-- ============================================================
-- 5. AUTO-CREATE SHOP on first sign-up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.shops (owner_id, name, name_en)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'shop_name', 'የእኔ ሱቅ'),
    coalesce(new.raw_user_meta_data->>'shop_name', 'My Shop')
  )
  on conflict (owner_id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 6. HELPER: get current user's shop_id
-- ============================================================
create or replace function public.my_shop_id()
returns uuid language sql security definer
set search_path = public as $$
  select id from public.shops where owner_id = auth.uid() limit 1;
$$;

-- ============================================================
-- 7. APPLY VOICE COMMAND (atomic RPC)
-- ============================================================
create or replace function public.apply_voice_command(
  p_raw_transcript text,
  p_action         text,
  p_item_name      text,
  p_quantity       integer,
  p_shop_id        uuid default null
)
returns jsonb language plpgsql security definer
set search_path = public as $$
declare
  v_shop_id  uuid;
  v_item     public.inventory_items%rowtype;
  v_before   integer;
  v_after    integer;
  v_cmd_id   uuid;
  v_revenue  numeric(10,2);
begin
  v_shop_id := public.my_shop_id();

  if v_shop_id is null then
    return jsonb_build_object('success', false, 'error', 'shop_not_found');
  end if;

  if p_action not in ('add', 'subtract', 'set') then
    insert into voice_commands (shop_id, raw_transcript, parsed_action, parsed_item, parsed_quantity, status, error_message)
    values (v_shop_id, p_raw_transcript, 'unknown', p_item_name, p_quantity, 'failed', 'Unknown action');
    return jsonb_build_object('success', false, 'error', 'unknown_action');
  end if;

  if p_item_name is null or trim(p_item_name) = '' then
    insert into voice_commands (shop_id, raw_transcript, parsed_action, parsed_item, parsed_quantity, status, error_message)
    values (v_shop_id, p_raw_transcript, p_action, p_item_name, p_quantity, 'failed', 'Missing item name');
    return jsonb_build_object('success', false, 'error', 'missing_item');
  end if;

  if p_quantity is null or p_quantity < 0 then
    insert into voice_commands (shop_id, raw_transcript, parsed_action, parsed_item, parsed_quantity, status, error_message)
    values (v_shop_id, p_raw_transcript, p_action, p_item_name, p_quantity, 'failed', 'Invalid quantity');
    return jsonb_build_object('success', false, 'error', 'invalid_quantity');
  end if;

  select * into v_item
  from inventory_items
  where shop_id = v_shop_id
    and lower(trim(name_am)) = lower(trim(p_item_name))
    and is_active = true
  for update;

  if not found then
    if p_action = 'subtract' then
      insert into voice_commands (shop_id, raw_transcript, parsed_action, parsed_item, parsed_quantity, status, error_message)
      values (v_shop_id, p_raw_transcript, p_action, p_item_name, p_quantity, 'failed', 'Item not found');
      return jsonb_build_object('success', false, 'error', 'item_not_found');
    end if;

    v_before  := 0;
    v_after   := case p_action when 'add' then p_quantity when 'set' then p_quantity else 0 end;
    v_revenue := 0;

    insert into inventory_items (shop_id, name_am, quantity, emoji)
    values (v_shop_id, trim(p_item_name), v_after, '📦')
    returning * into v_item;
  else
    v_before  := v_item.quantity;
    v_after   := case p_action
      when 'add'      then v_before + p_quantity
      when 'subtract' then greatest(v_before - p_quantity, 0)
      when 'set'      then p_quantity
    end;
    v_revenue := case p_action
      when 'subtract' then v_item.price_birr * p_quantity
      else 0
    end;

    update inventory_items set quantity = v_after where id = v_item.id
    returning * into v_item;
  end if;

  insert into voice_commands (
    shop_id, item_id, raw_transcript, parsed_action, parsed_item, parsed_quantity,
    quantity_before, quantity_after, status, revenue_birr
  ) values (
    v_shop_id, v_item.id, p_raw_transcript, p_action, trim(p_item_name), p_quantity,
    v_before, v_after, 'applied', v_revenue
  ) returning id into v_cmd_id;

  return jsonb_build_object(
    'success',         true,
    'command_id',      v_cmd_id,
    'item',            row_to_json(v_item),
    'quantity_before', v_before,
    'quantity_after',  v_after,
    'revenue_birr',    v_revenue
  );
end; $$;

-- ============================================================
-- 8. UNDO LAST COMMAND (RPC)
-- ============================================================
create or replace function public.undo_last_command()
returns jsonb language plpgsql security definer
set search_path = public as $$
declare
  v_shop_id uuid;
  v_cmd     public.voice_commands%rowtype;
begin
  v_shop_id := public.my_shop_id();
  if v_shop_id is null then
    return jsonb_build_object('success', false, 'error', 'shop_not_found');
  end if;

  select * into v_cmd
  from voice_commands
  where shop_id = v_shop_id and status = 'applied'
  order by created_at desc
  limit 1;

  if not found then
    return jsonb_build_object('success', false, 'error', 'nothing_to_undo');
  end if;

  if v_cmd.item_id is not null and v_cmd.quantity_before is not null then
    update inventory_items
    set quantity = v_cmd.quantity_before
    where id = v_cmd.item_id and shop_id = v_shop_id;
  end if;

  update voice_commands set status = 'undone' where id = v_cmd.id;

  return jsonb_build_object('success', true, 'undone_command_id', v_cmd.id);
end; $$;

-- ============================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================
alter table public.shops           enable row level security;
alter table public.inventory_items enable row level security;
alter table public.voice_commands  enable row level security;

create policy "shop_owner_all"
  on public.shops for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "inventory_owner_select"
  on public.inventory_items for select
  using (shop_id = public.my_shop_id());

create policy "inventory_owner_insert"
  on public.inventory_items for insert
  with check (shop_id = public.my_shop_id());

create policy "inventory_owner_update"
  on public.inventory_items for update
  using (shop_id = public.my_shop_id())
  with check (shop_id = public.my_shop_id());

create policy "inventory_owner_delete"
  on public.inventory_items for delete
  using (shop_id = public.my_shop_id());

create policy "vc_owner_select"
  on public.voice_commands for select
  using (shop_id = public.my_shop_id());

create policy "vc_owner_insert"
  on public.voice_commands for insert
  with check (shop_id = public.my_shop_id());

create policy "vc_owner_update"
  on public.voice_commands for update
  using (shop_id = public.my_shop_id());

-- ============================================================
-- 10. GRANTS
-- ============================================================
grant usage  on schema public to anon, authenticated;
grant select on public.shops            to authenticated;
grant all    on public.inventory_items  to authenticated;
grant all    on public.voice_commands   to authenticated;
grant execute on function public.apply_voice_command  to authenticated;
grant execute on function public.undo_last_command    to authenticated;
grant execute on function public.my_shop_id           to authenticated;

-- ============================================================
-- 11. REALTIME (safe to re-run)
-- ============================================================
do $$ begin
  alter publication supabase_realtime add table public.inventory_items;
exception when others then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.voice_commands;
exception when others then null;
end $$;

-- ============================================================
-- DONE. Sign up a user and their shop is auto-created.
-- ============================================================

-- ============================================================
-- 12. ADMIN ROLES & RPC (from 004_admin_roles.sql)
-- ============================================================
create table if not exists public.user_roles (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.user_roles enable row level security;

drop policy if exists "users_read_own_role" on public.user_roles;
create policy "users_read_own_role"
  on public.user_roles for select
  using (user_id = auth.uid());

drop policy if exists "admins_manage_roles" on public.user_roles;
create policy "admins_manage_roles"
  on public.user_roles for all
  using (
    exists (
      select 1 from public.user_roles r
      where r.user_id = auth.uid() and r.role = 'admin'
    )
  );

create or replace function public.is_admin()
returns boolean language sql security definer
set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.admin_get_all_users()
returns jsonb language plpgsql security definer
set search_path = public as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    return jsonb_build_object('error', 'unauthorized');
  end if;

  select jsonb_agg(row_to_json(u)) into result
  from (
    select
      au.id,
      au.email,
      au.created_at,
      au.last_sign_in_at,
      au.raw_user_meta_data->>'full_name'    as full_name,
      au.raw_user_meta_data->>'shop_name'    as shop_name_meta,
      au.raw_user_meta_data->>'phone_number' as phone_number,
      coalesce(ur.role, 'user')              as role,
      s.id                                   as shop_id,
      s.name                                 as shop_name,
      s.phone                                as shop_phone,
      s.location                             as shop_location,
      s.avatar_emoji,
      s.created_at                           as shop_created_at,
      coalesce(ic.item_count, 0)             as item_count,
      coalesce(ic.total_qty, 0)              as total_qty,
      coalesce(vc.command_count, 0)          as command_count,
      coalesce(vc.total_revenue, 0)          as total_revenue,
      coalesce(vc.last_command_at, null)     as last_command_at
    from auth.users au
    left join public.user_roles ur  on ur.user_id = au.id
    left join public.shops s        on s.owner_id  = au.id
    left join lateral (
      select
        count(*)          as item_count,
        sum(quantity)     as total_qty
      from public.inventory_items
      where shop_id = s.id and is_active = true
    ) ic on true
    left join lateral (
      select
        count(*)           as command_count,
        sum(revenue_birr)  as total_revenue,
        max(created_at)    as last_command_at
      from public.voice_commands
      where shop_id = s.id and status = 'applied'
    ) vc on true
    order by au.created_at desc
  ) u;

  return coalesce(result, '[]'::jsonb);
end; $$;

create or replace function public.admin_get_stats()
returns jsonb language plpgsql security definer
set search_path = public as $$
begin
  if not public.is_admin() then
    return jsonb_build_object('error', 'unauthorized');
  end if;

  return (
    select jsonb_build_object(
      'total_users',       (select count(*) from auth.users),
      'total_shops',       (select count(*) from public.shops),
      'total_items',       (select count(*) from public.inventory_items where is_active = true),
      'total_commands',    (select count(*) from public.voice_commands where status = 'applied'),
      'total_revenue',     (select coalesce(sum(revenue_birr), 0) from public.voice_commands where status = 'applied'),
      'users_today',       (select count(*) from auth.users where created_at >= now() - interval '24 hours'),
      'commands_today',    (select count(*) from public.voice_commands where status = 'applied' and created_at >= now() - interval '24 hours'),
      'revenue_today',     (select coalesce(sum(revenue_birr), 0) from public.voice_commands where status = 'applied' and created_at >= now() - interval '24 hours'),
      'users_this_week',   (select count(*) from auth.users where created_at >= now() - interval '7 days'),
      'commands_per_day',  (
        select jsonb_agg(row_to_json(d)) from (
          select
            date_trunc('day', created_at)::date as day,
            count(*) as commands,
            coalesce(sum(revenue_birr), 0) as revenue
          from public.voice_commands
          where status = 'applied' and created_at >= now() - interval '30 days'
          group by 1 order by 1
        ) d
      ),
      'signups_per_day', (
        select jsonb_agg(row_to_json(d)) from (
          select
            date_trunc('day', created_at)::date as day,
            count(*) as signups
          from auth.users
          where created_at >= now() - interval '30 days'
          group by 1 order by 1
        ) d
      ),
      'top_categories', (
        select jsonb_agg(row_to_json(d)) from (
          select
            coalesce(category, 'Uncategorized') as category,
            count(*) as item_count,
            sum(quantity) as total_qty
          from public.inventory_items
          where is_active = true
          group by 1 order by 2 desc limit 8
        ) d
      ),
      'action_breakdown', (
        select jsonb_agg(row_to_json(d)) from (
          select
            parsed_action as action,
            count(*) as count
          from public.voice_commands
          where status = 'applied' and parsed_action is not null
          group by 1
        ) d
      )
    )
  );
end; $$;

create or replace function public.admin_delete_user(p_user_id uuid)
returns jsonb language plpgsql security definer
set search_path = public as $$
begin
  if not public.is_admin() then
    return jsonb_build_object('success', false, 'error', 'unauthorized');
  end if;
  delete from auth.users where id = p_user_id;
  return jsonb_build_object('success', true);
end; $$;

drop policy if exists "admin_read_all_inventory" on public.inventory_items;
create policy "admin_read_all_inventory"
  on public.inventory_items for select
  using (public.is_admin());

drop policy if exists "admin_read_all_commands" on public.voice_commands;
create policy "admin_read_all_commands"
  on public.voice_commands for select
  using (public.is_admin());

grant select on public.user_roles to authenticated;
grant execute on function public.is_admin              to authenticated;
grant execute on function public.admin_get_all_users   to authenticated;
grant execute on function public.admin_get_stats       to authenticated;
grant execute on function public.admin_delete_user     to authenticated;
