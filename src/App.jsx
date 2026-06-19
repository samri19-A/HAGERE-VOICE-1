import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityChart }    from './components/ActivityChart';
import { CommandLog }       from './components/CommandLog';
import { Dashboard }        from './components/Dashboard';
import { ExportToolbar }    from './components/ExportToolbar';
import { InventoryList }    from './components/InventoryList';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { LowStockAlert }    from './components/LowStockAlert';
import { ManualCommandInput } from './components/ManualCommandInput';
import { Onboarding, shouldShowOnboarding } from './components/Onboarding';
import { ProductModal }     from './components/ProductModal';
import { ShopProfile }      from './components/ShopProfile';
import { SoldButton }       from './components/SoldButton';
import { StatusBar }        from './components/StatusBar';
import { Toast }            from './components/Toast';
import { VoiceButton }      from './components/VoiceButton';
import { useInventory }     from './hooks/useInventory';
import { useVoiceCommand }  from './hooks/useVoiceCommand';
import { t }                from './lib/i18n';
import { speakConfirmation, speakError } from './lib/tts';
import './App.css';

export default function App({ user, lang, onLangChange, onSignOut }) {
  const [processing,    setProcessing]    = useState(false);
  const [lastChangedId, setLastChangedId] = useState(null);
  const [voiceError,    setVoiceError]    = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => shouldShowOnboarding());

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);
  const clearToast = useCallback(() => setToast(null), []);

  // Product modal
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  // Shop profile modal
  const [profileOpen, setProfileOpen] = useState(false);

  // PWA install
  const [installPrompt, setInstallPrompt] = useState(null);
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  const handleInstall = () => {
    installPrompt?.prompt();
    installPrompt?.userChoice.then(() => setInstallPrompt(null));
  };

  const {
    items, commands, loading, error, lastResult,
    isOnline, queueCount, isSupabaseConfigured,
    handleVoiceCommand, handleUndo,
    handleAddProduct, handleEditProduct, handleDeleteProduct,
    handleReset,
  } = useInventory();

  // ── Core command handler (shared by voice + sold button) ────────────────
  const processCommand = useCallback(async (parsed, raw) => {
    if (parsed.confidence === 'low' || parsed.error) {
      const msg = t(lang, 'commandNotUnderstood');
      setVoiceError(msg);
      speakError(lang === 'am' ? 'ትዕዛዙ አልተረዳም። እንደገና ሞክር።' : msg);
      return;
    }
    setVoiceError(null);
    setProcessing(true);
    try {
      const result = await handleVoiceCommand(parsed, raw);
      const changedId = result?.item?.id;
      if (changedId) {
        setLastChangedId(changedId);
        setTimeout(() => setLastChangedId(null), 1800);
      }
      // Feature 1 – speak confirmation
      speakConfirmation({
        action: parsed.action,
        itemName: parsed.itemName,
        quantityBefore: result?.quantity_before ?? 0,
        quantityAfter:  result?.quantity_after  ?? 0,
        lang,
      });
      // Toast
      const actionLabel = {
        add:      t(lang, 'addKeyword'),
        subtract: t(lang, 'subtractKeyword'),
        set:      t(lang, 'setKeyword'),
      };
      showToast(`${parsed.itemName} — ${actionLabel[parsed.action]} ${parsed.quantity}  (${result?.quantity_before ?? '?'} → ${result?.quantity_after ?? '?'})`);
    } catch { /* error surfaced via useInventory */ }
    finally { setProcessing(false); }
  }, [handleVoiceCommand, lang, showToast]);

  const onVoiceError = useCallback((err) => {
    if (err?.error === 'speech_not_supported') return;
    setVoiceError(
      ['no_action', 'no_item', 'empty'].includes(err?.error)
        ? t(lang, 'commandNotUnderstood')
        : (err?.error || 'Voice error')
    );
  }, [lang]);

  const {
    isListening, isSupported,
    interimTranscript, transcript,
    startListening, stopListening, submitManual,
  } = useVoiceCommand({ onCommand: processCommand, onError: onVoiceError });

  // Spacebar shortcut
  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        isListeningRef.current ? stopListening() : startListening();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [startListening, stopListening]);

  // Modal
  const openAddModal  = () => { setEditingItem(null); setModalOpen(true); };
  const openEditModal = (item) => { setEditingItem(item); setModalOpen(true); };
  const closeModal    = () => { setModalOpen(false); setEditingItem(null); };

  const handleModalSave = async (data) => {
    if (editingItem) {
      await handleEditProduct(editingItem.id, data);
      showToast(`${data.name_am} — ${t(lang, 'toastUpdated')}`);
    } else {
      await handleAddProduct(data);
      showToast(`${data.name_am} — ${t(lang, 'toastAdded')}`);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(t(lang, 'deleteConfirm'))) return;
    await handleDeleteProduct(item.id);
    showToast(`${item.name_am} — ${t(lang, 'toastRemoved')}`, 'error');
  };

  const handleUndoClick = async () => {
    const undone = await handleUndo();
    if (undone) showToast(t(lang, 'undoSuccess'), 'info');
  };

  const displayTranscript = interimTranscript || transcript;
  const combinedError     = voiceError || error;

  // Show onboarding overlay on first visit
  if (showOnboarding) {
    return <Onboarding lang={lang} onDone={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="app">
      <Toast message={toast?.message} type={toast?.type} onDone={clearToast} />

      <header>
        <div className="header-top">
          <div className="header-brand">
            <h1>{t(lang, 'appTitle')}</h1>
            <p className="tagline">{t(lang, 'tagline')}</p>
          </div>
        <div className="header-right">
          {/* Stats strip — full width row under title */}
          <div className="header-controls">
            {installPrompt && (
              <button type="button" className="install-btn" onClick={handleInstall}>
                📲 {t(lang, 'installApp')}
              </button>
            )}
            <LanguageSwitcher lang={lang} onChange={onLangChange} />
            <div className="user-menu">
              <button
                type="button"
                className="user-avatar"
                onClick={() => setProfileOpen(true)}
                title={lang === 'am' ? 'የሱቅ መረጃ' : 'Shop Profile'}
              >
                {user
                  ? (user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()
                  : '👤'}
              </button>
              {user && (
                <button type="button" className="signout-btn" onClick={onSignOut}>
                  {lang === 'am' ? 'ውጣ' : 'Sign out'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Dashboard stats — full width strip below title row */}
      <Dashboard items={items} commands={commands} lang={lang} />
        <StatusBar isOnline={isOnline} isSupabaseConfigured={isSupabaseConfigured} queueCount={queueCount} lang={lang} />
        <LowStockAlert items={items} lang={lang} />
      </header>

      <main>
        {/* Voice panel */}
        <section className="panel voice-panel">
          <h2>{t(lang, 'voiceCommand')}</h2>
          <VoiceButton
            isListening={isListening} isSupported={isSupported}
            onStart={startListening} onStop={stopListening}
            disabled={processing} lang={lang}
          />
          <p className="shortcut-hint">{t(lang, 'spaceHint')}</p>

          {/* Feature 3 – "ሸጥኩ" sold button */}
          <SoldButton items={items} onSell={processCommand} disabled={isListening || processing} lang={lang} />

          {displayTranscript && (
            <p className="transcript live">
              <span className="label">{lang === 'am' ? 'የተሰማ፦' : 'Heard:'}</span> {displayTranscript}
            </p>
          )}

          <ManualCommandInput onSubmit={submitManual} disabled={isListening || processing} lang={lang} />

          <button type="button" className="undo-btn" onClick={handleUndoClick} disabled={processing}>
            ↩ {t(lang, 'undo')}
          </button>

          {combinedError && <p className="error" role="alert">{combinedError}</p>}
        </section>

        {/* Inventory panel */}
        <section className="panel inventory-panel">
          <div className="panel-header">
            <h2>{t(lang, 'inventoryTitle')}</h2>
            <button type="button" className="add-product-btn" onClick={openAddModal}>
              + {t(lang, 'addProduct')}
            </button>
          </div>
          <InventoryList
            items={items} loading={loading} lang={lang}
            lastChangedId={lastChangedId}
            onEdit={openEditModal} onDelete={handleDelete}
          />
        </section>

        {/* Activity chart */}
        <section className="panel chart-panel">
          <h2>{t(lang, 'dailyActivity')}</h2>
          <ActivityChart commands={commands} lang={lang} />
        </section>

        {/* Command log */}
        <section className="panel log-panel">
          <CommandLog commands={commands} lastResult={lastResult} lang={lang} />
        </section>
      </main>

      <ExportToolbar items={items} commands={commands} lang={lang} onReset={handleReset} />

      <footer>
        <p>{t(lang, 'footerHint')}</p>
      </footer>

      {modalOpen && (
        <ProductModal item={editingItem} lang={lang} onSave={handleModalSave} onClose={closeModal} />
      )}
      {profileOpen && (
        <ShopProfile
          lang={lang}
          user={user}
          onClose={() => setProfileOpen(false)}
          onSaved={() => showToast(t(lang, 'profileSaved'))}
        />
      )}
    </div>
  );
}
