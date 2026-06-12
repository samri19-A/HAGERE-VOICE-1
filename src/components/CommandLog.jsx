import { t } from '../lib/i18n';

function timeAgo(dateStr, lang) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)  return lang === 'am' ? `${diff} ሰከንድ በፊት`  : `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60)  return lang === 'am' ? `${mins} ደቂቃ በፊት`   : `${mins}m ago`;
  const hrs  = Math.floor(mins / 60);
  return lang === 'am' ? `${hrs} ሰዓት በፊት` : `${hrs}h ago`;
}

export function CommandLog({ commands, lastResult, lang }) {
  const ACTION_LABELS = {
    add:      t(lang, 'addKeyword'),
    subtract: t(lang, 'subtractKeyword'),
    set:      t(lang, 'setKeyword'),
  };

  return (
    <div className="command-log">
      {lastResult && (
        <div className="last-result success">
          <p><strong>{t(lang, 'interpreted')}</strong>፦ {lastResult.rawTranscript}</p>
          <p>
            {lastResult.parsed.itemName} —{' '}
            {ACTION_LABELS[lastResult.parsed.action] || lastResult.parsed.action}{' '}
            {lastResult.parsed.quantity}
          </p>
          {lastResult.result?.quantity_before != null && (
            <p className="qty-change">
              {lastResult.result.quantity_before} → {lastResult.result.quantity_after}
            </p>
          )}
        </div>
      )}

      <h3>{t(lang, 'recentCommands')}</h3>
      {commands.length === 0 ? (
        <p className="empty">{t(lang, 'noCommands')}</p>
      ) : (
        <ul>
          {commands.map((cmd) => (
            <li key={cmd.id} className={cmd.status === 'undone' ? 'cmd-undone' : ''}>
              <span className="cmd-transcript">
                {cmd.status === 'undone' && '↩ '}
                {cmd.raw_transcript}
              </span>
              <span className="cmd-meta">
                {cmd.parsed_item} · {ACTION_LABELS[cmd.parsed_action] || cmd.parsed_action}{' '}
                {cmd.parsed_quantity}
                {cmd.quantity_before != null && (
                  <> · {cmd.quantity_before}→{cmd.quantity_after}</>
                )}
                {cmd.created_at && (
                  <span className="cmd-time"> · {timeAgo(cmd.created_at, lang)}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
