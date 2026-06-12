/**
 * inventoryService.js — 100% Supabase, no localStorage fallback.
 * All data belongs to the authenticated user's shop (via RLS + my_shop_id()).
 */
import { supabase } from './supabase';
import { enqueueCommand, getQueuedCommands, removeFromQueue } from './offlineQueue';

// ── Fetch ─────────────────────────────────────────────────────────────────────

export async function fetchInventory() {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .order('name_am');
  if (error) throw error;
  return data ?? [];
}

export async function fetchVoiceCommands(limit = 30) {
  const { data, error } = await supabase
    .from('voice_commands')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ── Voice command (RPC) ───────────────────────────────────────────────────────

export async function applyVoiceCommand(parsed, rawTranscript) {
  if (!navigator.onLine) {
    enqueueCommand({ parsed, rawTranscript });
    throw new Error('offline_queued');
  }

  const { data, error } = await supabase.rpc('apply_voice_command', {
    p_raw_transcript: rawTranscript,
    p_action:         parsed.action,
    p_item_name:      parsed.itemName,
    p_quantity:       parsed.quantity,
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'apply_failed');
  return data;
}

// ── Undo (RPC) ────────────────────────────────────────────────────────────────

export async function undoLastCommand() {
  const { data, error } = await supabase.rpc('undo_last_command');
  if (error) throw error;
  if (!data?.success) return null;
  return data;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function addProduct(product) {
  // shop_id is resolved by RLS (my_shop_id()), we don't send it
  const { data, error } = await supabase
    .from('inventory_items')
    .insert([{
      name_am:             product.name_am.trim(),
      name_en:             product.name_en?.trim() || null,
      quantity:            Number(product.quantity) || 0,
      unit:                product.unit || 'ቁጥር',
      category:            product.category || null,
      emoji:               product.emoji || '📦',
      low_stock_threshold: Number(product.low_stock_threshold) || 3,
      shop_id:             await getShopId(),
    }])
    .select()
    .single();
  if (error) {
    if (error.code === '23505') throw new Error('duplicate_item');
    throw error;
  }
  return data;
}

export async function editProduct(itemId, updates) {
  // Remove fields that shouldn't be sent as updates
  const { id: _id, shop_id: _s, created_at: _c, ...safeUpdates } = updates;
  const { data, error } = await supabase
    .from('inventory_items')
    .update(safeUpdates)
    .eq('id', itemId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(itemId) {
  // Soft delete — keeps voice command history intact
  const { error } = await supabase
    .from('inventory_items')
    .update({ is_active: false })
    .eq('id', itemId);
  if (error) throw error;
}

export async function updateItemCategory(itemId, category) {
  return editProduct(itemId, { category });
}

export async function updateItemThreshold(itemId, threshold) {
  return editProduct(itemId, { low_stock_threshold: Number(threshold) });
}

// ── Shop profile ──────────────────────────────────────────────────────────────

export async function fetchShop() {
  // Use maybeSingle() instead of single() — returns null if no row yet
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .maybeSingle();

  if (error) throw error;

  // If no shop row yet (trigger may not have fired), return safe defaults
  if (!data) {
    return {
      name: '',
      name_en: '',
      phone: '',
      location: '',
      description: '',
      avatar_emoji: '🏪',
    };
  }
  return data;
}

export async function updateShop(updates) {
  // RLS already scopes this to the current user's shop via owner_id
  // Use upsert so it works even if the shop row doesn't exist yet
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('not_authenticated');

  const { data, error } = await supabase
    .from('shops')
    .upsert({
      owner_id: userId,
      ...updates,
    }, {
      onConflict: 'owner_id',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Reset (demo helper — clears and re-seeds the user's inventory) ────────────

export async function resetInventory() {
  const shopId = await getShopId();
  if (!shopId) throw new Error('no_shop');

  // Delete all items for this shop
  await supabase.from('inventory_items').delete().eq('shop_id', shopId);
  await supabase.from('voice_commands').delete().eq('shop_id', shopId);

  // Re-insert seed data
  const seed = [
    { name_am: 'ሱሪ',   name_en: 'Dress',  quantity: 12, unit: 'ቁጥር', category: 'ልብስ', emoji: '👗', low_stock_threshold: 3, shop_id: shopId },
    { name_am: 'ቀሚስ',  name_en: 'Shirt',  quantity: 8,  unit: 'ቁጥር', category: 'ልብስ', emoji: '👕', low_stock_threshold: 3, shop_id: shopId },
    { name_am: 'ሻማ',   name_en: 'Scarf',  quantity: 25, unit: 'ቁጥር', category: 'ልብስ', emoji: '🧣', low_stock_threshold: 3, shop_id: shopId },
    { name_am: 'ካፖርት', name_en: 'Jacket', quantity: 5,  unit: 'ቁጥር', category: 'ልብስ', emoji: '🧥', low_stock_threshold: 3, shop_id: shopId },
    { name_am: 'ጫማ',   name_en: 'Shoes',  quantity: 2,  unit: 'ጥንድ',  category: 'ጫማ',  emoji: '👟', low_stock_threshold: 3, shop_id: shopId },
  ];
  const { error } = await supabase.from('inventory_items').insert(seed);
  if (error) throw error;
}

// ── Offline sync ──────────────────────────────────────────────────────────────

export async function syncOfflineQueue() {
  if (!navigator.onLine) return { synced: 0, failed: 0 };
  const queue = getQueuedCommands();
  let synced = 0, failed = 0;
  for (const entry of queue) {
    try {
      await applyVoiceCommand(entry.parsed, entry.rawTranscript);
      removeFromQueue(entry.id);
      synced++;
    } catch { failed++; }
  }
  return { synced, failed };
}

// ── Internal helper ───────────────────────────────────────────────────────────

async function getShopId() {
  const { data } = await supabase.rpc('my_shop_id');
  return data;
}
