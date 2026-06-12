import { useEffect } from 'react';

/**
 * Feature 3 – Toast notification
 * Usage: <Toast message="..." type="success|error|info" onDone={() => ...} />
 */
export function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <span className="toast-icon">
        {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      </span>
      {message}
    </div>
  );
}
