import { useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';
import { fetchShop, updateShop } from '../lib/inventoryService';

const SHOP_EMOJIS = ['🏪','🏬','👗','👟','🧣','🥻','🛍️','🧵','💎','🌸','🌺','🏡','⭐','🌟','✨'];

export function ShopProfile({ lang, user, onClose, onSaved }) {
  const [shop,      setShop]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const firstRef = useRef(null);

  // ── Load shop data ──────────────────────────────────────────────────────────
  useEffect(() => {
    const phoneFromAuth = user?.user_metadata?.phone_number || '';

    fetchShop()
      .then((shopData) => {
        setShop({
          name:         shopData?.name         || user?.user_metadata?.shop_name || '',
          name_en:      shopData?.name_en      || '',
          phone:        shopData?.phone        || phoneFromAuth,
          location:     shopData?.location     || '',
          description:  shopData?.description  || '',
          avatar_emoji: shopData?.avatar_emoji || '🏪',
        });
      })
      .catch(() => {
        setShop({
          name:         user?.user_metadata?.shop_name || '',
          name_en:      '',
          phone:        phoneFromAuth,
          location:     '',
          description:  '',
          avatar_emoji: '🏪',
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  // ── Keyboard / focus ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading) firstRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, onClose]);

  const set = (field) => (e) => setShop((s) => ({ ...s, [field]: e.target.value }));

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!shop.name?.trim()) {
      setError(lang === 'am' ? 'ስም ያስፈልጋል' : 'Shop name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateShop({
        name:         shop.name.trim(),
        name_en:      shop.name_en?.trim()    || null,
        phone:        shop.phone?.trim()      || null,
        location:     shop.location?.trim()   || null,
        description:  shop.description?.trim()|| null,
        avatar_emoji: shop.avatar_emoji       || '🏪',
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-profile" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>🏪 {t(lang, 'shopProfile')}</h2>

        {loading ? (
          <p className="loading" style={{ textAlign: 'center', padding: '2rem' }}>…</p>
        ) : (
          <form onSubmit={handleSave} noValidate>

            {/* Shop icon */}
            <div className="form-row emoji-row">
              <label>{t(lang, 'shopAvatar')}</label>
              <button type="button" className="emoji-preview" onClick={() => setShowEmoji((v) => !v)}>
                {shop?.avatar_emoji || '🏪'}
              </button>
              {showEmoji && (
                <div className="emoji-grid">
                  {SHOP_EMOJIS.map((em) => (
                    <button key={em} type="button"
                      className={`emoji-opt ${shop?.avatar_emoji === em ? 'selected' : ''}`}
                      onClick={() => { setShop((s) => ({ ...s, avatar_emoji: em })); setShowEmoji(false); }}
                    >{em}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Shop name (Amharic) */}
            <div className="form-row">
              <label>{t(lang, 'shopName')} *</label>
              <input ref={firstRef} type="text" value={shop?.name || ''} onChange={set('name')} dir="auto" required />
            </div>

            {/* Shop name (English) */}
            <div className="form-row">
              <label>{t(lang, 'shopNameEn')}</label>
              <input type="text" value={shop?.name_en || ''} onChange={set('name_en')} />
            </div>

            {/* Owner name — read-only from auth */}
            <div className="form-row">
              <label>{t(lang, 'ownerName')}</label>
              <input
                type="text"
                value={user?.user_metadata?.full_name || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            {/* Phone — read-only (it's the login identifier) */}
            <div className="form-row">
              <label>
                {t(lang, 'shopPhone')}{' '}
                <span style={{ fontSize: '0.75rem', color: '#6b5c52', fontWeight: 400 }}>
                  ({lang === 'am' ? 'የመለያ ቁጥር — ለውጥ አይደረግም' : 'Login ID — cannot change'})
                </span>
              </label>
              <input
                type="tel"
                value={user?.user_metadata?.phone_number || shop?.phone || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            {/* Location */}
            <div className="form-row">
              <label>{t(lang, 'shopLocation')}</label>
              <input
                type="text"
                value={shop?.location || ''}
                onChange={set('location')}
                dir="auto"
                placeholder={lang === 'am' ? 'ለምሳሌ፦ አዲስ አበባ, ቦሌ' : 'e.g. Addis Ababa, Bole'}
              />
            </div>

            {/* Description */}
            <div className="form-row">
              <label>{t(lang, 'shopDescription')}</label>
              <textarea
                value={shop?.description || ''}
                onChange={set('description')}
                rows={2}
                dir="auto"
                placeholder={lang === 'am' ? 'ስለ ሱቅዎ አጭር መግለጫ…' : 'Short description of your shop…'}
              />
            </div>

            {error && <p className="modal-error">{error}</p>}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>{t(lang, 'cancel')}</button>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? '…' : t(lang, 'save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
