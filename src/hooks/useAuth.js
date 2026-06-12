import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [authError, setAuthError] = useState(null);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Sign up ───────────────────────────────────────────────────────────────
  const signUp = useCallback(async ({ email, password, fullName, shopName }) => {
    setAuthError(null);

    // Extract phone number from the fake email we use (0912345678@hagere.local)
    const phoneNumber = email.replace('@hagere.local', '');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:    fullName,
          shop_name:    shopName || fullName,
          phone_number: phoneNumber,   // store the real phone
        },
      },
    });
    if (error) { setAuthError(error.message); throw error; }

    // Also update the auth phone field if Supabase supports it
    // (best-effort, no throw on failure)
    if (data?.user) {
      await supabase.auth.updateUser({
        phone: `+251${phoneNumber.slice(1)}`, // convert 09... → +2519...
      }).catch(() => {});
    }

    return data;
  }, []);

  // ── Sign in ───────────────────────────────────────────────────────────────
  const signIn = useCallback(async ({ email, password }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setAuthError(error.message); throw error; }
    return data;
  }, []);

  // ── Sign out ──────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    setAuthError(null);
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { user, loading, authError, signUp, signIn, signOut };
}
