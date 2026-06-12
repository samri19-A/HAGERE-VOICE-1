/**
 * Feature 6 – WhatsApp share button
 * Formats inventory as plain Amharic text and opens wa.me
 */
export function WhatsAppShare({ items, lang }) {
  const handleShare = () => {
    const date = new Date().toLocaleDateString('am-ET', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const header = lang === 'am'
      ? `📦 HAGERE VOICE — የዛሬ (${date}) እቃ ዝርዝር\n\n`
      : `📦 HAGERE VOICE — Inventory (${date})\n\n`;

    const lines = items.map((item) => {
      const lowMark = item.quantity <= (item.low_stock_threshold ?? 3) ? ' ⚠️' : '';
      const nameEn  = item.name_en ? ` (${item.name_en})` : '';
      return `• ${item.name_am}${nameEn}: ${item.quantity} ${item.unit || 'ቁጥር'}${lowMark}`;
    });

    const footer = lang === 'am'
      ? '\n\n🎤 HAGERE VOICE ሲስተም የተላከ'
      : '\n\nSent from HAGERE VOICE';

    const message = header + lines.join('\n') + footer;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <button type="button" className="toolbar-btn btn-whatsapp" onClick={handleShare}>
      <span>💬</span>
      {lang === 'am' ? 'WhatsApp ላክ' : 'Share on WhatsApp'}
    </button>
  );
}
