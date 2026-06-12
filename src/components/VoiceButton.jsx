import { t } from '../lib/i18n';

export function VoiceButton({ isListening, isSupported, onStart, onStop, disabled, lang }) {
  return (
    <div className="voice-section">
      <button
        type="button"
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        onClick={isListening ? onStop : onStart}
        disabled={disabled && !isListening}
        aria-pressed={isListening}
        aria-label={isListening ? t(lang, 'stopListening') : t(lang, 'startListening')}
      >
        <span className="mic-icon" aria-hidden="true">
          {isListening ? '⏹' : '🎤'}
        </span>
        <span>{isListening ? t(lang, 'stopListening') : t(lang, 'startListening')}</span>
      </button>
      {!isSupported && (
        <p className="hint warning">{t(lang, 'notSupported')}</p>
      )}
    </div>
  );
}
