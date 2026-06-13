-- ============================================================
-- HAGERE VOICE — Create Admin User + Assign Role
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- This creates the admin account AND confirms the email automatically.
-- ============================================================

DO $$
DECLARE
  v_admin_id uuid;
  v_encrypted_pw text;
BEGIN

  -- Check if user already exists
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'samrawitabebaw680@gmail.com'
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    -- Create the user with email already confirmed
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'samrawitabebaw680@gmail.com',
      crypt('Sam1919@', gen_salt('bf')),
      now(),   -- email confirmed immediately
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin","role":"admin"}',
      false,
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO v_admin_id;

    -- Also create the identity record (required for email login)
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_admin_id,
      'samrawitabebaw680@gmail.com',
      'email',
      jsonb_build_object('sub', v_admin_id::text, 'email', 'samrawitabebaw680@gmail.com'),
      now(),
      now(),
      now()
    );

    RAISE NOTICE 'Admin user CREATED with id: %', v_admin_id;
  ELSE
    -- User exists — make sure email is confirmed and password is correct
    UPDATE auth.users
    SET
      encrypted_password = crypt('Sam1919@', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at         = now()
    WHERE id = v_admin_id;

    RAISE NOTICE 'Admin user already EXISTS, password reset. id: %', v_admin_id;
  END IF;

  -- Assign admin role (safe to run multiple times)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_admin_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

  RAISE NOTICE 'Admin role assigned successfully to %', v_admin_id;

END $$;

-- ── Verify ────────────────────────────────────────────────────────────────────
-- Run this to confirm everything worked:
SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  r.role
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE u.email = 'samrawitabebaw680@gmail.com';
