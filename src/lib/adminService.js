/**
 * adminService.js — all admin calls go through Supabase RPCs.
 * Every RPC is security definer and checks is_admin() server-side.
 * Direct table queries are NOT used — they would be blocked by RLS.
 */
import { supabase } from './supabase';

// ── Platform stats ─────────────────────────────────────────────────────────────
export async function adminGetStats() {
  const { data, error } = await supabase.rpc('admin_get_stats');
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

// ── All users with shop + stats ────────────────────────────────────────────────
export async function adminGetAllUsers() {
  const { data, error } = await supabase.rpc('admin_get_all_users');
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return Array.isArray(data) ? data : [];
}

// ── Delete a user (cascades shop / items / commands) ──────────────────────────
export async function adminDeleteUser(userId) {
  const { data, error } = await supabase.rpc('admin_delete_user', { p_user_id: userId });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'delete_failed');
  return data;
}

// ── Per-user inventory (RLS-bypassed via RPC) ─────────────────────────────────
export async function adminGetUserInventory(shopId) {
  if (!shopId) return [];
  const { data, error } = await supabase.rpc('admin_get_shop_inventory', { p_shop_id: shopId });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return Array.isArray(data) ? data : [];
}

// ── Per-user voice commands (RLS-bypassed via RPC) ────────────────────────────
export async function adminGetUserCommands(shopId, limit = 50) {
  if (!shopId) return [];
  const { data, error } = await supabase.rpc('admin_get_shop_commands', {
    p_shop_id: shopId,
    p_limit:   limit,
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return Array.isArray(data) ? data : [];
}

// ── User feedback ─────────────────────────────────────────────────────────────
export async function adminGetFeedback(limit = 100) {
  const { data, error } = await supabase.rpc('admin_get_feedback', { p_limit: limit });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
