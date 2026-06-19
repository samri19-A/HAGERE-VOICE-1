import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { t } from '../lib/i18n';
import './RoleSelector.css';

export function RoleSelector({ lang, onLangChange, onSelectUser, onSelectAdmin, onBack }) {
  return (
    <div className="role-page">
      {/* Background circles */}
      <div className="role-bg">
        <div className="role-circle c1" />
        <div className="role-circle c2" />
        <div className="role-circle c3" />
      </div>

      <button className="role-back-btn" onClick={onBack} type="button">
        ← {t(lang, 'back')}
      </button>

      <div className="role-lang">
        <LanguageSwitcher lang={lang} onChange={onLangChange} />
      </div>

      <div className="role-card">
        <div className="role-card-strip" />

        <div className="role-header">
          <div className="role-logo">🎤</div>
          <h1>HAGERE VOICE</h1>
          <p>{t(lang, 'roleTitle')}</p>
        </div>

        <div className="role-options">
          {/* User option */}
          <button
            type="button"
            className="role-option role-option-user"
            onClick={onSelectUser}
          >
            <div className="role-option-icon">👤</div>
            <div className="role-option-body">
              <strong>{t(lang, 'roleUserTitle')}</strong>
              <span>{t(lang, 'roleUserDesc')}</span>
            </div>
            <div className="role-option-arrow">→</div>
          </button>

          {/* Admin option */}
          <button
            type="button"
            className="role-option role-option-admin"
            onClick={onSelectAdmin}
          >
            <div className="role-option-icon">🛡️</div>
            <div className="role-option-body">
              <strong>{t(lang, 'roleAdminTitle')}</strong>
              <span>{t(lang, 'roleAdminDesc')}</span>
            </div>
            <div className="role-option-arrow">→</div>
          </button>
        </div>

        <p className="role-footer-note">
          🇪🇹 {t(lang, 'roleFooter')}
        </p>
      </div>
    </div>
  );
}
