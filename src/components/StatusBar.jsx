import { t } from '../lib/i18n';

export function StatusBar({ isOnline, isSupabaseConfigured, queueCount, lang }) {
  return (
    <div className="status-bar">
      <span className={`pill ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? t(lang, 'online') : t(lang, 'offline')}
      </span>
      <span className="pill">
        {isSupabaseConfigured ? 'Supabase ✓' : t(lang, 'localDemo')}
      </span>
      {queueCount > 0 && (
        <span className="pill queue">
          {queueCount} {t(lang, 'queued')}
        </span>
      )}
    </div>
  );
}
