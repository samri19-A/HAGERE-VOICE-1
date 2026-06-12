import { LANGUAGES } from '../lib/i18n';

export function LanguageSwitcher({ lang, onChange }) {
  return (
    <div className="lang-switcher">
      {Object.entries(LANGUAGES).map(([code, label]) => (
        <button
          key={code}
          type="button"
          className={`lang-btn ${lang === code ? 'active' : ''}`}
          onClick={() => onChange(code)}
          aria-pressed={lang === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
