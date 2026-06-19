import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { t } from '../lib/i18n';
import './AdminLogin.css';

export function AdminLogin({ lang, onBack }) {
  const { adminSignIn } = useAuth();
  const [email,    setEmail]    = useState('samrawitabebaw680@gmail.com');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState('');
  const [showPw,   setShowPw]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErr('');
    try {
      await adminSignIn({ email: email.trim(), password });
    } catch (ex) {
      const msg = ex?.message || '';
      if (msg.includes('admin_access_denied')) {
        setErr(lang === 'am' ? 'ይህ አካውንት የአስተዳዳሪ መዳረሻ የለውም።' : 'This account does not have admin access.');
      } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
        setErr(lang === 'am' ? 'ኢሜይል ወይም የይለፍ ቃል ስህተት ነው።' : 'Wrong email or password.');
      } else {
        setErr(msg || (lang === 'am' ? 'መግባት አልተሳካም። እንደገና ይሞክሩ።' : 'Sign in failed. Try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg">
        <div className="admin-bg-circle c1" />
        <div className="admin-bg-circle c2" />
        <div className="admin-bg-circle c3" />
      </div>

      <button className="admin-login-back" onClick={onBack} type="button">
        ← {lang === 'am' ? 'ወደ መግቢያ ተመለስ' : 'Back to Home'}
      </button>

      <div className="admin-login-card">
        <div className="admin-login-strip" />

        <div className="admin-login-header">
          <div className="admin-login-icon">🛡️</div>
          <h1>{lang === 'am' ? 'የአስተዳዳሪ ፖርታል' : 'Admin Portal'}</h1>
          <p>{lang === 'am' ? 'HAGERE VOICE — የመድረክ አስተዳደር' : 'HAGERE VOICE — Platform Management'}</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          <div className="admin-field">
            <label htmlFor="admin-email">{t(lang, 'authEmailLabel')}</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="admin-field">
            <label htmlFor="admin-password">{t(lang, 'authPasswordLabel')}</label>
            <div className="admin-pw-wrap">
              <input
                id="admin-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="admin-pw-toggle"
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {err && <p className="admin-login-error" role="alert">⚠️ {err}</p>}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading || !email || !password}
          >
            {loading ? <span className="admin-spinner" /> : (lang === 'am' ? '🔐 እንደ አስተዳዳሪ ግባ' : '🔐 Sign In as Admin')}
          </button>
        </form>

        <p className="admin-login-note">
          {lang === 'am'
            ? '🔒 የተገደበ መዳረሻ። ለተፈቀደላቸው ሰራተኞች ብቻ።'
            : '🔒 Restricted access. Authorized personnel only.'}
        </p>
      </div>
    </div>
  );
}
