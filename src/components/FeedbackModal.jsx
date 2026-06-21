import { useEffect, useRef, useState } from 'react';
import { submitFeedback } from '../lib/feedbackService';
import { t } from '../lib/i18n';

const CATEGORIES = [
  { id: 'general', icon: '💬' },
  { id: 'voice',   icon: '🎤' },
  { id: 'bug',     icon: '🐛' },
  { id: 'feature', icon: '💡' },
];

export function FeedbackModal({ lang, source = 'app', onClose, onSuccess }) {
  const [rating, setRating]       = useState(0);
  const [hover, setHover]         = useState(0);
  const [category, setCategory]   = useState('general');
  const [message, setMessage]     = useState('');
  const [contactName, setContactName]   = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(false);
  const firstRef = useRef(null);

  const showContact = source === 'landing';

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape' && !submitting) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      setError(t(lang, 'feedbackRatingRequired'));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitFeedback({
        rating,
        category,
        message,
        source,
        lang,
        contactName,
        contactEmail,
      });
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError(
        err.message === 'submit_failed'
          ? t(lang, 'feedbackSubmitError')
          : (err.message || t(lang, 'feedbackSubmitError'))
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal feedback-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="feedback-done">
            <div className="feedback-done-icon">✅</div>
            <h2>{t(lang, 'feedbackThanksTitle')}</h2>
            <p>{t(lang, 'feedbackThanksDesc')}</p>
            <button type="button" className="btn-save" onClick={onClose}>
              {t(lang, 'feedbackClose')}
            </button>
          </div>
        ) : (
          <>
            <h2>{t(lang, 'feedbackTitle')}</h2>
            <p className="feedback-subtitle">{t(lang, 'feedbackSubtitle')}</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <label>{t(lang, 'feedbackRatingLabel')}</label>
                <div className="feedback-stars" role="group" aria-label={t(lang, 'feedbackRatingLabel')}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      ref={n === 1 ? firstRef : undefined}
                      type="button"
                      className={`feedback-star ${n <= (hover || rating) ? 'active' : ''}`}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      aria-label={`${n} / 5`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <label>{t(lang, 'feedbackCategoryLabel')}</label>
                <div className="feedback-categories">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`feedback-cat ${category === c.id ? 'active' : ''}`}
                      onClick={() => setCategory(c.id)}
                    >
                      {c.icon} {t(lang, `feedbackCat_${c.id}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="feedback-message">{t(lang, 'feedbackMessageLabel')}</label>
                <textarea
                  id="feedback-message"
                  className="feedback-textarea"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t(lang, 'feedbackMessagePlaceholder')}
                  dir="auto"
                />
              </div>

              {showContact && (
                <>
                  <div className="form-row">
                    <label htmlFor="feedback-name">{t(lang, 'feedbackNameLabel')}</label>
                    <input
                      id="feedback-name"
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={t(lang, 'feedbackNamePlaceholder')}
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="feedback-email">{t(lang, 'feedbackEmailLabel')}</label>
                    <input
                      id="feedback-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder={t(lang, 'feedbackEmailPlaceholder')}
                    />
                  </div>
                </>
              )}

              {error && <p className="feedback-error" role="alert">{error}</p>}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
                  {t(lang, 'cancel')}
                </button>
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? t(lang, 'feedbackSending') : t(lang, 'feedbackSubmit')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
