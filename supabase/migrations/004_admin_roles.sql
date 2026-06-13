-- ============================================================
-- HAGERE VOICE — Admin Roles Migration
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================

-- ── 1. USER ROLES TABLE ──────────────────────────────────────────────────────
create table if not exists public.user_roles (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.user_roles enable row level security;

-- Drop old policies if they exist (safe re-run)
drop policy if exists "users_read_own_role"   on public.user_roles;
drop policy if exists "admins_manage_roles"   on public.user_roles;
drop policy if exists "service_role_all"      on public.user_roles;

-- Users can read their own role
create policy "users_read_own_role"
  on public.user_roles for select
  using (user_id = auth.uid());

-- Admins can manage all roles
create policy "admins_manage_roles"
  on public.user_roles for all
  using (
    exists (
      select 1 from public.user_roles r
      where r.user_id = auth.uid() and r.role = 'admin'
    )
  );

-- ── 2. FUNCTIONS ─────────────────────────────────────────────────────────────

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
declare result jsonb;
begin
  if not public.is_admin() then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  select jsonb_agg(row_to_json(u)) into result
  from (
    select
      au.id, au.email, au.created_at, au.last_sign_in_at,
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
      select count(*) as item_count, sum(quantity) as total_qty
      from public.inventory_items where shop_id = s.id and is_active = true
    ) ic on true
    left join lateral (
      select count(*) as command_count, sum(revenue_birr) as total_revenue, max(created_at) as last_command_at
      from public.voice_commands where shop_id = s.id and status = 'applied'
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
      'total_users',      (select count(*) from auth.users),
      'total_shops',      (select count(*) from public.shops),
      'total_items',      (select count(*) from public.inventory_items where is_active = true),
      'total_commands',   (select count(*) from public.voice_commands where status = 'applied'),
      'total_revenue',    (select coalesce(sum(revenue_birr), 0) from public.voice_commands where status = 'applied'),
      'users_today',      (select count(*) from auth.users where created_at >= now() - interval '24 hours'),
      'commands_today',   (select count(*) from public.voice_commands where status = 'applied' and created_at >= now() - interval '24 hours'),
      'revenue_today',    (select coalesce(sum(revenue_birr), 0) from public.voice_commands where status = 'applied' and created_at >= now() - interval '24 hours'),
      'users_this_week',  (select count(*) from auth.users where created_at >= now() - interval '7 days'),
      'commands_per_day', (
        select jsonb_agg(row_to_json(d)) from (
          select date_trunc('day', created_at)::date as day, count(*) as commands, coalesce(sum(revenue_birr),0) as revenue
          from public.voice_commands where status = 'applied' and created_at >= now() - interval '30 days'
          group by 1 order by 1
        ) d
      ),
      'signups_per_day', (
        select jsonb_agg(row_to_json(d)) from (
          select date_trunc('day', created_at)::date as day, count(*) as signups
          from auth.users where created_at >= now() - interval '30 days'
          group by 1 order by 1
        ) d
      ),
      'top_categories', (
        select jsonb_agg(row_to_json(d)) from (
          select coalesce(category,'Uncategorized') as category, count(*) as item_count, sum(quantity) as total_qty
          from public.inventory_items where is_active = true group by 1 order by 2 desc limit 8
        ) d
      ),
      'action_breakdown', (
        select jsonb_agg(row_to_json(d)) from (
          select parsed_action as action, count(*) as count
          from public.voice_commands where status = 'applied' and parsed_action is not null group by 1
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

-- ── 3. GRANTS ─────────────────────────────────────────────────────────────────
grant select on public.user_roles to authenticated;
grant execute on function public.is_admin             to authenticated;
grant execute on function public.admin_get_all_users  to authenticated;
grant execute on function public.admin_get_stats      to authenticated;
grant execute on function public.admin_delete_user    to authenticated;

-- ── 4. ASSIGN ADMIN ROLE ──────────────────────────────────────────────────────
-- This block finds the admin user by email and assigns them the admin role.
-- Safe to re-run multiple times.
do $$
declare
  v_admin_id uuid;
begin
  select id into v_admin_id
  from auth.users
  where email = 'samrawitabebaw680@gmail.com'
  limit 1;

  if v_admin_id is not null then
    insert into public.user_roles (user_id, role)
    values (v_admin_id, 'admin')
    on conflict (user_id) do update set role = 'admin';
    raise notice 'SUCCESS: Admin role assigned to user %', v_admin_id;
  else
    raise notice 'USER NOT FOUND: Sign up with samrawitabebaw680@gmail.com first, then re-run this migration.';
  end if;
end $$;

-- ── DONE ──────────────────────────────────────────────────────────────────────
-- After running this:
-- 1. Go to Supabase → Authentication → Users
-- 2. Find samrawitabebaw680@gmail.com
-- 3. Click the user → confirm email manually if needed
-- 4. Login at the Admin Portal with that email + your password
