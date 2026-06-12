import { useState } from 'react';
import { t } from '../lib/i18n';

/**
 * Feature 3 – "ሸጥኩ" (I sold) quick-subtract panel.
 * Shows a big red button + item picker for the most common daily action.
 */
export function SoldButton({ items, onSell, disabled, lang }) {
  const [open,     setOpen]     = useState(false);
  const [selected, setSelected] = useState('');
  const [qty,      setQty]      = useState(1);

  const handleSell = () => {
    if (!selected) return;
    const raw = `ሸጥኩ ${selected} ${qty}`;
    onSell({ action: 'subtract', itemName: selected, quantity: qty, confidence: 'high' }, raw);
    setOpen(false);
    setSelected('');
    setQty(1);
  };

  if (!open) {
    return (
      <button
        type="button"
        className="sold-trigger-btn"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        🛍️ {lang === 'am' ? 'ሸጥኩ' : 'I Sold'}
      </button>
    );
  }

  return (
    <div className="sold-panel">
      <p className="sold-label">{lang === 'am' ? 'ምን ሸጡ?' : 'What did you sell?'}</p>

      {/* Item grid */}
      <div className="sold-items-grid">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sold-item-chip ${selected === item.name_am ? 'selected' : ''}`}
            onClick={() => setSelected(item.name_am)}
          >
            <span className="sold-item-emoji">{item.emoji || '📦'}</span>
            <span>{item.name_am}</span>
          </button>
        ))}
      </div>

      {/* Quantity stepper */}
      <div className="sold-qty-row">
        <button type="button" className="qty-step" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
        <span className="qty-display">{qty}</span>
        <button type="button" className="qty-step" onClick={() => setQty((q) => q + 1)}>+</button>
      </div>

      <div className="sold-actions">
        <button type="button" className="sold-cancel" onClick={() => setOpen(false)}>
          {t(lang, 'cancel')}
        </button>
        <button
          type="button"
          className="sold-confirm"
          onClick={handleSell}
          disabled={!selected}
        >
          ✓ {lang === 'am' ? 'ሸጠ' : 'Confirm Sale'}
        </button>
      </div>
    </div>
  );
}
