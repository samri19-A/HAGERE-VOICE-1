import { useState } from 'react';
import { EXAMPLE_COMMANDS } from '../lib/amharicParser';
import { t } from '../lib/i18n';

export function ManualCommandInput({ onSubmit, disabled, lang }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
    setText('');
  };

  return (
    <div className="manual-input">
      <form onSubmit={handleSubmit}>
        <label htmlFor="command-input">{t(lang, 'manualLabel')}</label>
        <div className="input-row">
          <input
            id="command-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="ሱሪ ሁለት ጨመር"
            disabled={disabled}
            dir="auto"
          />
          <button type="submit" disabled={disabled || !text.trim()}>
            {t(lang, 'send')}
          </button>
        </div>
      </form>
      <div className="examples">
        <span>{t(lang, 'examples')}</span>
        {EXAMPLE_COMMANDS.map((ex) => (
          <button
            key={ex.am}
            type="button"
            className="chip"
            onClick={() => onSubmit(ex.am)}
            disabled={disabled}
            title={ex.en}
          >
            {ex.am}
          </button>
        ))}
      </div>
    </div>
  );
}
