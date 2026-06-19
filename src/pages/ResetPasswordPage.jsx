import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { t } from '../lib/i18n';
import './ResetPasswordPage.css';

export function ResetPasswordPage({ lang, onComplete, onBack }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) return;
    if (password.length < 6) {
      setErr(t(lang, 'authPasswordMinLength'));
      return;
    }

    setLoading(true);
    setErr('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(async () => {
        await supabase.auth.signOut();
        onComplete();
      }, 2000);
    } catch (ex) {
      setErr(t(lang, 'resetError'));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = password.length >= 6 && password === confirmPassword;

  return (
    <div className="reset-pw-page">
      {/* Background circles */}
      <div className="reset-bg">
        <div className="reset-circle c1" />
        <div className="reset-circle c2" />
        <div className="reset-circle c3" />
      </div>

      <button className="reset-back-btn" onClick={onBack} type="button">
        ← {t(lang, 'back')}
      </button>

      <div className="reset-card">
        <div className="reset-card-strip" />

        <div className="reset-header">
          <div className="reset-logo">🔒</div>
          <h1>{t(lang, 'resetTitle')}</h1>
          <p>{t(lang, 'resetSubtitle')}</p>
        </div>

        {success ? (
          <div className="reset-success-banner">
            <span className="reset-success-icon">✓</span>
            <p>{t(lang, 'resetSuccess')}</p>
          </div>
        ) : (
          <form className="reset-form" onSubmit={handleSubmit} noValidate>
            <div className="reset-field">
              <label htmlFor="new-password">{t(lang, 'authPasswordLabel')} *</label>
              <div className="reset-pw-wrap">
                <input
                  id="new-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  className="reset-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="reset-field">
              <label htmlFor="confirm-password">{t(lang, 'authConfirmPasswordLabel')} *</label>
              <input
                id="confirm-password"
                type={showPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            {password && password.length < 6 && (
              <p className="reset-error-msg">⚠️ {t(lang, 'authPasswordMinLength')}</p>
            )}

            {password && confirmPassword && password !== confirmPassword && (
              <p className="reset-error-msg">⚠️ {t(lang, 'authPasswordsMismatch')}</p>
            )}

            {err && <p className="reset-general-error" role="alert">⚠️ {err}</p>}

            <button
              type="submit"
              className="reset-btn"
              disabled={loading || !isFormValid}
            >
              {loading ? <span className="reset-spinner" /> : t(lang, 'resetUpdateBtn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
