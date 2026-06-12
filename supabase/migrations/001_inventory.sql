-- HAGERE VOICE: inventory + voice command audit trail
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists "uuid-ossp";

-- Core inventory table (one row per shop item)
create table if not exists public.inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name_am text not null,
  name_en text,
  quantity integer not null default 0 check (quantity >= 0),
  unit text default 'ቁጥር',
  shop_id uuid not null default '00000000-0000-0000-0000-000000000001',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, name_am)
);

-- Every voice command that changes inventory (demo / audit)
create table if not exists public.voice_commands (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null default '00000000-0000-0000-0000-000000000001',
  raw_transcript text not null,
  parsed_action text check (parsed_action in ('add', 'subtract', 'set', 'unknown')),
  parsed_item text,
  parsed_quantity integer,
  quantity_before integer,
  quantity_after integer,
  status text not null default 'pending'
    check (status in ('pending', 'applied', 'failed', 'queued_offline')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_inventory_shop on public.inventory_items (shop_id);
create index if not exists idx_voice_commands_shop on public.voice_commands (shop_id, created_at desc);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists inventory_items_updated_at on public.inventory_items;
create trigger inventory_items_updated_at
  before update on public.inventory_items
  for each row execute function public.set_updated_at();

-- RPC: apply a parsed voice command atomically (quantity + audit log)
create or replace function public.apply_voice_command(
  p_shop_id uuid,
  p_raw_transcript text,
  p_action text,
  p_item_name text,
  p_quantity integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.inventory_items%rowtype;
  v_before integer;
  v_after integer;
  v_cmd_id uuid;
begin
  if p_action not in ('add', 'subtract', 'set') then
  insert into voice_commands (shop_id, raw_transcript, parsed_action, parsed_item, parsed_quantity, status, error_message)
  values (p_shop_id, p_raw_transcript, coalesce(p_action, 'unknown'), p_item_name, p_quantity, 'failed', 'Unknown action');
    return jsonb_build_object('success', false, 'error', 'unknown_action');
  end if;

  if p_item_name is null or trim(p_item_name) = '' then
    insert into voice_commands (shop_id, raw_transcript, parsed_action, parsed_item, parsed_quantity, status, error_message)
    values (p_shop_id, p_raw_transcript, p_action, p_item_name, p_quantity, 'failed', 'Missing item name');
    return jsonb_build_object('success', false, 'error', 'missing_item');
  end if;

  if p_quantity is null or p_quantity < 0 then
    insert into voice_commands (shop_id, raw_transcript, parsed_action, parsed_item, parsed_quantity, status, error_message)
    values (p_shop_id, p_raw_transcript, p_action, p_item_name, p_quantity, 'failed', 'Invalid quantity');
    return jsonb_build_object('success', false, 'error', 'invalid_quantity');
  end if;

  select * into v_item
  from inventory_items
  where shop_id = p_shop_id and lower(trim(name_am)) = lower(trim(p_item_name))
  for update;

  if not found then
    if p_action = 'subtract' then
      insert into voice_commands (shop_id, raw_transcript, parsed_action, parsed_item, parsed_quantity, status, error_message)
      values (p_shop_id, p_raw_transcript, p_action, p_item_name, p_quantity, 'failed', 'Item not found');
      return jsonb_build_object('success', false, 'error', 'item_not_found');
    end if;

    v_before := 0;
    v_after := case p_action
      when 'add' then p_quantity
      when 'set' then p_quantity
      else 0
    end;

    insert into inventory_items (shop_id, name_am, quantity)
    values (p_shop_id, trim(p_item_name), v_after)
    returning * into v_item;
  else
    v_before := v_item.quantity;
    v_after := case p_action
      when 'add' then v_before + p_quantity
      when 'subtract' then greatest(v_before - p_quantity, 0)
      when 'set' then p_quantity
    end;

    update inventory_items set quantity = v_after where id = v_item.id
    returning * into v_item;
  end if;

  insert into voice_commands (
    shop_id, raw_transcript, parsed_action, parsed_item, parsed_quantity,
    quantity_before, quantity_after, status
  ) values (
    p_shop_id, p_raw_transcript, p_action, trim(p_item_name), p_quantity,
    v_before, v_after, 'applied'
  ) returning id into v_cmd_id;

  return jsonb_build_object(
    'success', true,
    'command_id', v_cmd_id,
    'item', jsonb_build_object('id', v_item.id, 'name_am', v_item.name_am, 'quantity', v_item.quantity),
    'quantity_before', v_before,
    'quantity_after', v_after
  );
end;
$$;

-- Demo seed data
insert into public.inventory_items (name_am, name_en, quantity, unit) values
  ('ሱሪ', 'Dress', 12, 'ቁጥር'),
  ('ቀሚስ', 'Shirt', 8, 'ቁጥር'),
  ('ሻማ', 'Scarf', 25, 'ቁጥር')
on conflict (shop_id, name_am) do nothing;

-- RLS: open for MVP demo (tighten before production)
alter table public.inventory_items enable row level security;
alter table public.voice_commands enable row level security;

create policy "MVP read inventory" on public.inventory_items for select using (true);
create policy "MVP write inventory" on public.inventory_items for all using (true) with check (true);
create policy "MVP read commands" on public.voice_commands for select using (true);
create policy "MVP write commands" on public.voice_commands for insert with check (true);

grant usage on schema public to anon, authenticated;
grant all on public.inventory_items to anon, authenticated;
grant all on public.voice_commands to anon, authenticated;
grant execute on function public.apply_voice_command to anon, authenticated;

-- Enable Realtime for live demo UI
alter publication supabase_realtime add table public.inventory_items;
alter publication supabase_realtime add table public.voice_commands;
