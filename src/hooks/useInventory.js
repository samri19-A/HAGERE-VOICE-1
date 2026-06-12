import { useCallback, useEffect, useState } from 'react';
import {
  addProduct,
  applyVoiceCommand,
  deleteProduct,
  editProduct,
  fetchInventory,
  fetchVoiceCommands,
  resetInventory,
  syncOfflineQueue,
  undoLastCommand,
  updateItemCategory,
  updateItemThreshold,
} from '../lib/inventoryService';
import { getQueuedCommands } from '../lib/offlineQueue';
import { supabase } from '../lib/supabase';

export function useInventory() {
  const [items,      setItems]      = useState([]);
  const [commands,   setCommands]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [lastResult, setLastResult] = useState(null);
  const [error,      setError]      = useState(null);
  const [isOnline,   setIsOnline]   = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(getQueuedCommands().length);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inventory, voiceCommands] = await Promise.all([
        fetchInventory(),
        fetchVoiceCommands(),
      ]);
      setItems(inventory);
      setCommands(voiceCommands);
      setQueueCount(getQueuedCommands().length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Online / offline ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await syncOfflineQueue();
      refresh();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refresh]);

  // ── Supabase realtime ──────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('hagere-inventory')
      .on('postgres_changes', { event: '*',      schema: 'public', table: 'inventory_items' }, () => refresh())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'voice_commands'  }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleVoiceCommand = useCallback(async (parsed, rawTranscript) => {
    setError(null);
    try {
      const result = await applyVoiceCommand(parsed, rawTranscript);
      setLastResult({ parsed, rawTranscript, result });
      await refresh();
      return result;
    } catch (err) {
      if (err.message === 'offline_queued') {
        setQueueCount((c) => c + 1);
        return null;
      }
      const message = err.message === 'item_not_found'
        ? 'እቃው አልተገኘም — በመጀመሪያ ጨምር ይበሉ'
        : err.message;
      setError(message);
      throw err;
    }
  }, [refresh]);

  const handleUndo = useCallback(async () => {
    const result = await undoLastCommand();
    if (result) await refresh();
    return result;
  }, [refresh]);

  const handleAddProduct = useCallback(async (product) => {
    setError(null);
    try {
      const newItem = await addProduct(product);
      await refresh();
      return newItem;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [refresh]);

  const handleEditProduct = useCallback(async (itemId, updates) => {
    setError(null);
    try {
      const updated = await editProduct(itemId, updates);
      await refresh();
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [refresh]);

  const handleDeleteProduct = useCallback(async (itemId) => {
    setError(null);
    try {
      await deleteProduct(itemId);
      await refresh();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [refresh]);

  const handleReset = useCallback(async () => {
    setError(null);
    try {
      await resetInventory();
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }, [refresh]);

  const handleUpdateCategory = useCallback(async (itemId, category) => {
    await updateItemCategory(itemId, category);
    await refresh();
  }, [refresh]);

  const handleUpdateThreshold = useCallback(async (itemId, threshold) => {
    await updateItemThreshold(itemId, threshold);
    await refresh();
  }, [refresh]);

  return {
    items, commands, loading, error, lastResult,
    isOnline, queueCount,
    isSupabaseConfigured: true, // always true now
    refresh,
    handleVoiceCommand,
    handleUndo,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleReset,
    handleUpdateCategory,
    handleUpdateThreshold,
  };
}
