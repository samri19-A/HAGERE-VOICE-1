-- ============================================================
-- HAGERE VOICE — Migration 003: Price & Revenue tracking
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Add price per unit to inventory items
alter table public.inventory_items
  add column if not exists price_birr numeric(10,2) not null default 0 check (price_birr >= 0);

-- Add revenue tracking to voice commands (price * qty on subtract = sale)
alter table public.voice_commands
  add column if not exists revenue_birr numeric(10,2) default 0;

-- Add shop description field
alter table public.shops
  add column if not exists description text,
  add column if not exists avatar_emoji text default '🏪';

-- Update apply_voice_command to record revenue on sales
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
  v_shop_id    uuid;
  v_item       public.inventory_items%rowtype;
  v_before     integer;
  v_after      integer;
  v_cmd_id     uuid;
  v_revenue    numeric(10,2);
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

    v_before := 0;
    v_after  := case p_action when 'add' then p_quantity when 'set' then p_quantity else 0 end;
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
    -- Revenue = price × units sold (only on subtract/sale)
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

-- Grant execute on updated function
grant execute on function public.apply_voice_command to authenticated;
