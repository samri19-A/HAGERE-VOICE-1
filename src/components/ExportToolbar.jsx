import { exportCSV, exportPDF } from '../lib/exportService';
import { t } from '../lib/i18n';
import { WhatsAppShare } from './WhatsAppShare';

export function ExportToolbar({ items, commands, lang, onReset }) {
  const handlePDF   = () => exportPDF(items, commands, lang);
  const handleCSV   = () => exportCSV(items, lang);
  const handleReset = () => {
    if (window.confirm(t(lang, 'resetConfirm'))) onReset();
  };

  return (
    <div className="export-toolbar">
      <WhatsAppShare items={items} lang={lang} />
      <button type="button" className="toolbar-btn btn-csv" onClick={handleCSV}>
        📄 {t(lang, 'exportCSV')}
      </button>
      <button type="button" className="toolbar-btn btn-pdf" onClick={handlePDF}>
        📑 {t(lang, 'exportPDF')}
      </button>
      <button type="button" className="toolbar-btn btn-reset" onClick={handleReset}>
        🔄 {t(lang, 'resetDemo')}
      </button>
    </div>
  );
}
