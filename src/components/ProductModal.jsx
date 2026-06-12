import { useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';

const UNITS      = ['ቁጥር', 'ጥንድ', 'ሜትር', 'ኪሎ', 'ሊትር', 'ፓኬት'];
const CATEGORIES = ['ልብስ', 'ጫማ', 'ምግብ', 'ሌላ'];

// Feature 5 – emoji picker for product icon
const EMOJIS = [
  '👗','👘','🥻','👙','👚','👕','👖','🧥','🥼','🧣','🧤','🧢','👒','🎩',
  '👠','👡','👢','👟','👞','🥿','🩴','👜','👝','🎒','🧳','💍','💎',
  '🍎','🍊','🍋','🍇','🥑','🌽','🧅','🧄','🥩','🐟','🍞','🧆',
  '📦','🏺','🪣','🧴','🪥','🧹','🪑','🛋️','🖼️','📿',
];

const EMPTY_FORM = {
  name_am: '', name_en: '', quantity: '', unit: 'ቁጥር',
  category: '', low_stock_threshold: '3', emoji: '📦', price_birr: '0',
};

export function ProductModal({ item, lang, onSave, onClose }) {
  const isEdit = Boolean(item);
  const [form, setForm] = useState(
    isEdit
      ? {
          name_am: item.name_am,
          name_en: item.name_en || '',
          quantity: item.quantity,
          unit: item.unit || 'ቁጥር',
          category: item.category || '',
          low_stock_threshold: item.low_stock_threshold ?? 3,
          emoji: item.emoji || '📦',
          price_birr: item.price_birr ?? 0,
        }
      : { ...EMPTY_FORM }
  );
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFieldError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name_am.trim()) {
      setFieldError(lang === 'am' ? 'ስም ያስፈልጋል' : 'Name is required');
      return;
    }
    if (form.quantity === '' || Number(form.quantity) < 0) {
      setFieldError(lang === 'am' ? 'ትክክለኛ ብዛት ያስፈልጋል' : 'Valid quantity required');
      return;
    }
    setSubmitting(true);
    try {
      await onSave({
        ...form,
        quantity: Number(form.quantity),
        low_stock_threshold: Number(form.low_stock_threshold) || 3,
        price_birr: Number(form.price_birr) || 0,
      });
      onClose();
    } catch (err) {
      setFieldError(
        err.message === 'duplicate_item'
          ? (lang === 'am' ? 'ይህ እቃ አሁን አለ' : 'Item already exists')
          : err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? t(lang, 'editProductTitle') : t(lang, 'addProductTitle')}</h2>

        <form onSubmit={handleSubmit} noValidate>

          {/* Feature 5 – emoji picker */}
          <div className="form-row emoji-row">
            <label>{lang === 'am' ? 'ምልክት ምረጥ' : 'Pick an icon'}</label>
            <button
              type="button"
              className="emoji-preview"
              onClick={() => setShowEmojis((v) => !v)}
              title={lang === 'am' ? 'ምልክት ምረጥ' : 'Pick icon'}
            >
              {form.emoji}
            </button>
            {showEmojis && (
              <div className="emoji-grid">
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    className={`emoji-opt ${form.emoji === em ? 'selected' : ''}`}
                    onClick={() => { setForm((f) => ({ ...f, emoji: em })); setShowEmojis(false); }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-row">
            <label>{t(lang, 'nameAm')} *</label>
            <input
              ref={firstInputRef}
              type="text"
              value={form.name_am}
              onChange={set('name_am')}
              dir="auto"
              required
            />
          </div>

          <div className="form-row">
            <label>{t(lang, 'nameEn')}</label>
            <input type="text" value={form.name_en} onChange={set('name_en')} />
          </div>

          <div className="form-row two-col">
            <div>
              <label>{t(lang, 'initialQty')} *</label>
              <input type="number" min="0" value={form.quantity} onChange={set('quantity')} required />
            </div>
            <div>
              <label>{t(lang, 'unit')}</label>
              <select value={form.unit} onChange={set('unit')}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row two-col">
            <div>
              <label>{t(lang, 'category')}</label>
              <select value={form.category} onChange={set('category')}>
                <option value="">{t(lang, 'noCategory')}</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>{t(lang, 'lowStockThreshold')}</label>
              <input
                type="number"
                min="0"
                value={form.low_stock_threshold}
                onChange={set('low_stock_threshold')}
              />
            </div>
          </div>

          {/* Price per unit */}
          <div className="form-row">
            <label>{t(lang, 'pricePerUnit')} 💰</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.price_birr}
              onChange={set('price_birr')}
              placeholder="0"
            />
          </div>

          {fieldError && <p className="modal-error">{fieldError}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {t(lang, 'cancel')}
            </button>
            <button type="submit" className="btn-save" disabled={submitting}>
              {submitting ? '…' : t(lang, 'save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
