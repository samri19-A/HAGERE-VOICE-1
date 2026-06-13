import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user,      setUser]      = useState(null);
  const [role,      setRole]      = useState(null);   // 'admin' | 'user' | null
  const [loading,   setLoading]   = useState(true);
  const [authError, setAuthError] = useState(null);

  // Prevent double-init race between getSession + onAuthStateChange
  const initialised = useRef(false);

  const fetchRole = useCallback(async (uid) => {
    if (!uid) { setRole(null); return; }
    try {
      // Use security-definer RPC — bypasses RLS, always works
      const { data: isAdminResult } = await supabase.rpc('is_admin');
      if (isAdminResult === true) {
        setRole('admin');
      } else {
        setRole('user');
      }
    } catch {
      setRole('user');
    }
  }, []);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // onAuthStateChange fires immediately with the current session,
    // so we can rely on it alone — skip the separate getSession call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        await fetchRole(u?.id);
        // Only set loading=false after the very first resolution
        if (!initialised.current) {
          initialised.current = true;
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  // ── Admin sign in (email + password) ─────────────────────────────────────
  // Role check happens inside onAuthStateChange above,
  // but we do an early check here so we can give immediate feedback.
  const adminSignIn = useCallback(async ({ email, password }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      throw error;
    }

    // Check role immediately using security-definer RPC — bypasses RLS
    const { data: isAdminResult } = await supabase.rpc('is_admin');

    if (!isAdminResult) {
      // Sign out silently — listener will update state
      await supabase.auth.signOut();
      const denied = new Error('admin_access_denied');
      setAuthError(denied.message);
      throw denied;
    }

    // Already signed in — listener will update user + role state
    return data;
  }, []);

  // ── Sign up (phone-based fake email) ─────────────────────────────────────
  const signUp = useCallback(async ({ email, password, fullName, shopName }) => {
    setAuthError(null);
    const phoneNumber = email.replace('@hagere.local', '');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:    fullName,
          shop_name:    shopName || fullName,
          phone_number: phoneNumber,
        },
      },
    });
    if (error) { setAuthError(error.message); throw error; }
    return data;
  }, []);

  // ── Sign in (phone-based fake email) ─────────────────────────────────────
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
    // listener sets user/role to null
  }, []);

  return {
    user,
    role,
    isAdmin: role === 'admin',
    loading,
    authError,
    adminSignIn,
    signUp,
    signIn,
    signOut,
  };
}
