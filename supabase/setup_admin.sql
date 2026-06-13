-- ============================================================
-- HAGERE VOICE — One-time admin account setup
-- Run in: Supabase Dashboard → SQL Editor
--
-- PREREQUISITE: Run migrations/004_admin_roles.sql (or master.sql) first.
--
-- BEFORE running this SQL:
-- 1. Authentication → Users → Add user → Create new user
-- 2. Email: samrawitabebaw680@gmail.com  (change below if needed)
-- 3. Password: (your chosen password)
-- 4. Turn ON "Auto Confirm User"
-- ============================================================

-- Grant admin role to your email
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'samrawitabebaw680@gmail.com'
on conflict (user_id) do update set role = 'admin';

-- Verify
select u.email, r.role, u.created_at
from auth.users u
left join public.user_roles r on r.user_id = u.id
where u.email = 'samrawitabebaw680@gmail.com';
