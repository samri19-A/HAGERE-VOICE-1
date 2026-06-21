-- ============================================================
-- HAGERE VOICE — User Feedback
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================

create table if not exists public.user_feedback (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete set null,
  shop_id       uuid references public.shops(id) on delete set null,
  rating        integer not null check (rating >= 1 and rating <= 5),
  category      text not null check (category in ('general', 'bug', 'voice', 'feature')),
  message       text,
  source        text not null default 'app' check (source in ('app', 'landing')),
  lang          text not null default 'en',
  contact_name  text,
  contact_email text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_feedback_created on public.user_feedback (created_at desc);
create index if not exists idx_feedback_category on public.user_feedback (category);

alter table public.user_feedback enable row level security;

-- ── Submit (anon + authenticated) ────────────────────────────────────────────
create or replace function public.submit_feedback(
  p_rating        integer,
  p_category      text,
  p_message       text default null,
  p_source        text default 'app',
  p_lang          text default 'en',
  p_contact_name  text default null,
  p_contact_email text default null
)
returns jsonb language plpgsql security definer
set search_path = public as $$
declare
  v_shop_id uuid;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    return jsonb_build_object('success', false, 'error', 'invalid_rating');
  end if;
  if p_category not in ('general', 'bug', 'voice', 'feature') then
    return jsonb_build_object('success', false, 'error', 'invalid_category');
  end if;

  if auth.uid() is not null then
    select id into v_shop_id from public.shops where owner_id = auth.uid() limit 1;
  end if;

  insert into public.user_feedback (
    user_id, shop_id, rating, category, message, source, lang, contact_name, contact_email
  ) values (
    auth.uid(),
    v_shop_id,
    p_rating,
    p_category,
    nullif(trim(p_message), ''),
    case when p_source in ('app', 'landing') then p_source else 'app' end,
    coalesce(nullif(trim(p_lang), ''), 'en'),
    nullif(trim(p_contact_name), ''),
    nullif(trim(p_contact_email), '')
  );

  return jsonb_build_object('success', true);
end;
$$;

-- ── Admin read ────────────────────────────────────────────────────────────────
create or replace function public.admin_get_feedback(p_limit integer default 100)
returns jsonb language plpgsql security definer
set search_path = public as $$
declare result jsonb;
begin
  if not public.is_admin() then
    return jsonb_build_object('error', 'unauthorized');
  end if;

  select jsonb_build_object(
    'total',       (select count(*) from public.user_feedback),
    'avg_rating',  (select round(avg(rating)::numeric, 1) from public.user_feedback),
    'by_category', (
      select coalesce(jsonb_agg(row_to_json(c)), '[]'::jsonb) from (
        select category, count(*) as count
        from public.user_feedback group by 1 order by 2 desc
      ) c
    ),
    'items', (
      select coalesce(jsonb_agg(row_to_json(f)), '[]'::jsonb) from (
        select
          uf.id, uf.rating, uf.category, uf.message, uf.source, uf.lang,
          uf.contact_name, uf.contact_email, uf.created_at,
          s.name as shop_name,
          au.email as user_email,
          au.raw_user_meta_data->>'full_name' as user_name
        from public.user_feedback uf
        left join public.shops s on s.id = uf.shop_id
        left join auth.users au on au.id = uf.user_id
        order by uf.created_at desc
        limit greatest(1, least(coalesce(p_limit, 100), 500))
      ) f
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.submit_feedback(integer, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.admin_get_feedback(integer) to authenticated;
