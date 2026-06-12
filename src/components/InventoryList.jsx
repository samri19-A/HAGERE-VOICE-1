import { useState } from 'react';
import { t } from '../lib/i18n';

/**
 * Inline editing (category dropdown + threshold input) removed.
 * All edits go through the ✏️ modal which requires deliberate action.
 */
export function InventoryList({
  items,
  loading,
  lang,
  lastChangedId,
  onEdit,
  onDelete,
}) {
  const [search,         setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  if (loading) return <p className="loading">{t(lang, 'loading')}</p>;

  const allCategories = ['all', ...new Set(items.map((i) => i.category).filter(Boolean))];

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.name_am.includes(search) ||
      (item.name_en || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="inventory-list-wrapper">
      {/* Search */}
      <input
        className="search-input"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t(lang, 'searchPlaceholder')}
        dir="auto"
      />

      {/* Category filter tabs — read-only, just for filtering */}
      <div className="category-tabs">
        {allCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'all' ? t(lang, 'allCategories') : cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty">{t(lang, 'empty')}</p>
      ) : (
        <ul className="inventory-list">
          {filtered.map((item) => {
            const threshold = item.low_stock_threshold ?? 3;
            const isLow     = item.quantity <= threshold;
            const isChanged = item.id === lastChangedId;

            return (
              <li key={item.id} className={`inventory-item ${isChanged ? 'flash' : ''}`}>
                {/* Left: emoji + name + category badge (display only) */}
                <div className="item-info">
                  <div className="item-name-row">
                    <span className="item-emoji">{item.emoji || '📦'}</span>
                    <div>
                      <strong>{item.name_am}</strong>
                      {item.name_en && <span className="item-en">{item.name_en}</span>}
                    </div>
                  </div>
                  {item.category && (
                    <span className="cat-badge">{item.category}</span>
                  )}
                </div>

                {/* Right: quantity + action buttons */}
                <div className="item-right">
                  <div className="item-qty">
                    {isLow && (
                      <span className="low-stock-badge" title={t(lang, 'lowStock')}>⚠️</span>
                    )}
                    <span className={`qty-number ${isLow ? 'qty-low' : ''}`}>
                      {item.quantity}
                    </span>
                    <span className="qty-unit">{item.unit || 'ቁጥር'}</span>
                  </div>

                  <div className="item-actions">
                    <button
                      type="button"
                      className="item-btn btn-edit"
                      onClick={() => onEdit?.(item)}
                      title={t(lang, 'editItem')}
                      aria-label={t(lang, 'editItem')}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="item-btn btn-del"
                      onClick={() => onDelete?.(item)}
                      title={t(lang, 'deleteItem')}
                      aria-label={t(lang, 'deleteItem')}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
