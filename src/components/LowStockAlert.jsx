import { t } from '../lib/i18n';

export function LowStockAlert({ items, lang }) {
  const lowItems = items.filter((i) => i.quantity <= 3);
  if (lowItems.length === 0) return null;

  return (
    <div className="low-stock-alert" role="alert">
      <span className="alert-icon">⚠️</span>
      <div className="alert-body">
        <strong>{t(lang, 'lowStock')}:</strong>{' '}
        {lowItems.map((i, idx) => (
          <span key={i.id}>
            <strong>{i.name_am}</strong>
            {i.name_en && ` (${i.name_en})`} — {i.quantity}
            {idx < lowItems.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}
