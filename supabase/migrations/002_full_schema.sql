-- ============================================================
-- HAGERE VOICE — Full Production Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fast Amharic text search

-- ============================================================
-- 1. SHOPS — one shop per user account
-- ============================================================
create table if not exists public.shops (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references auth.users(id) on delete cascade,
  name         text not null default 'የእኔ ሱቅ',
  name_en      text,
  phone        text,
  location     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (owner_id) -- one shop per user for now
);

-- ============================================================
-- 2. INVENTORY ITEMS
-- ============================================================
create table if not exists public.inventory_items (
  id                   uuid primary key default uuid_generate_v4(),
  shop_id              uuid not null references public.shops(id) on delete cascade,
  name_am              text not null,
  name_en              text,
  quantity             integer not null default 0 check (quantity >= 0),
  unit                 text not null default 'ቁጥር',
  category             text,
  emoji                text default '📦',
  low_stock_threshold  integer not null default 3 check (low_stock_threshold >= 0),
  is_active            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (shop_id, name_am)
);

create index if not exists idx_inventory_shop     on public.inventory_items (shop_id);
create index if not exists idx_inventory_name_am  on public.inventory_items using gin (name_am gin_trgm_ops);
create index if not exists idx_inventory_category on public.inventory_items (shop_id, category);

-- ============================================================
-- 3. VOICE COMMANDS — full audit trail
-- ============================================================
create table if not exists public.voice_commands (
  id               uuid primary key default uuid_generate_v4(),
  shop_id          uuid not null references public.shops(id) on delete cascade,
  item_id          uuid references public.inventory_items(id) on delete set null,
  raw_transcript   text not null,
  parsed_action    text check (parsed_action in ('add', 'subtract', 'set', 'unknown')),
  parsed_item      text,
  parsed_quantity  integer,
  quantity_before  integer,
  quantity_after   integer,
  status           text not null default 'pending'
                     check (status in ('pending', 'applied', 'failed', 'queued_offline', 'undone')),
  error_message    text,
  created_at       timestamptz not null default now()
);

create index if not exists idx_vc_shop on public.voice_commands (shop_id, created_at desc);
create index if not exists idx_vc_item on public.voice_commands (item_id);

-- ============================================================
-- 4. AUTO-UPDATE updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists shops_updated_at          on public.shops;
drop trigger if exists inventory_items_updated_at on public.inventory_items;

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

drop trigger if exists on_auth_user_created on auth.users;
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
  -- legacy param kept for compatibility, ignored (uses auth.uid() shop)
  p_shop_id        uuid default null
)
returns jsonb language plpgsql security definer
set search_path = public as $$
declare
  v_shop_id uuid;
  v_item    public.inventory_items%rowtype;
  v_before  integer;
  v_after   integer;
  v_cmd_id  uuid;
begin
  -- Always use the authenticated user's shop
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

  -- Lock the item row
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

    -- Auto-create on add/set
    v_before := 0;
    v_after  := case p_action when 'add' then p_quantity when 'set' then p_quantity else 0 end;

    insert into inventory_items (shop_id, name_am, quantity, emoji)
    values (v_shop_id, trim(p_item_name), v_after, '📦')
    returning * into v_item;
  else
    v_before := v_item.quantity;
    v_after  := case p_action
      when 'add'      then v_before + p_quantity
      when 'subtract' then greatest(v_before - p_quantity, 0)
      when 'set'      then p_quantity
    end;

    update inventory_items
    set quantity = v_after
    where id = v_item.id
    returning * into v_item;
  end if;

  insert into voice_commands (
    shop_id, item_id, raw_transcript, parsed_action, parsed_item, parsed_quantity,
    quantity_before, quantity_after, status
  ) values (
    v_shop_id, v_item.id, p_raw_transcript, p_action, trim(p_item_name), p_quantity,
    v_before, v_after, 'applied'
  ) returning id into v_cmd_id;

  return jsonb_build_object(
    'success',         true,
    'command_id',      v_cmd_id,
    'item',            row_to_json(v_item),
    'quantity_before', v_before,
    'quantity_after',  v_after
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

  -- Restore previous quantity
  if v_cmd.item_id is not null and v_cmd.quantity_before is not null then
    update inventory_items
    set quantity = v_cmd.quantity_before
    where id = v_cmd.item_id and shop_id = v_shop_id;
  end if;

  -- Mark command as undone
  update voice_commands set status = 'undone' where id = v_cmd.id;

  return jsonb_build_object('success', true, 'undone_command_id', v_cmd.id);
end; $$;

-- ============================================================
-- 9. ROW LEVEL SECURITY — users can only access their own shop
-- ============================================================
alter table public.shops           enable row level security;
alter table public.inventory_items enable row level security;
alter table public.voice_commands  enable row level security;

-- Drop ALL existing policies first (safe to re-run)
drop policy if exists "MVP read inventory"    on public.inventory_items;
drop policy if exists "MVP write inventory"   on public.inventory_items;
drop policy if exists "MVP read commands"     on public.voice_commands;
drop policy if exists "MVP write commands"    on public.voice_commands;
drop policy if exists "shop_owner_all"        on public.shops;
drop policy if exists "inventory_owner_select" on public.inventory_items;
drop policy if exists "inventory_owner_insert" on public.inventory_items;
drop policy if exists "inventory_owner_update" on public.inventory_items;
drop policy if exists "inventory_owner_delete" on public.inventory_items;
drop policy if exists "vc_owner_select"       on public.voice_commands;
drop policy if exists "vc_owner_insert"       on public.voice_commands;
drop policy if exists "vc_owner_update"       on public.voice_commands;

-- Shops: owner only
create policy "shop_owner_all"
  on public.shops for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Inventory: only items belonging to the user's shop
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

-- Voice commands: only for the user's shop
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
grant select on public.shops to authenticated;
grant all    on public.inventory_items to authenticated;
grant all    on public.voice_commands  to authenticated;
grant execute on function public.apply_voice_command  to authenticated;
grant execute on function public.undo_last_command    to authenticated;
grant execute on function public.my_shop_id           to authenticated;

-- ============================================================
-- 11. REALTIME — already enabled, nothing to do
-- (tables were added to supabase_realtime in a previous run)
-- ============================================================

-- ============================================================
-- DONE. Sign up a user to auto-create their shop.
-- ============================================================
