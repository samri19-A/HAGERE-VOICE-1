import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import './AuthPage.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Ethiopian phone validation:
 * - Exactly 10 digits
 * - Ethiotelecom: 09xxxxxxxx
 * - Safaricom ET: 07xxxxxxxx
 */
function isValidEthiopianPhone(digits) {
  if (digits.length !== 10) return false;
  return digits.startsWith('09') || digits.startsWith('07');
}

function getPhoneError(digits, lang) {
  if (digits.length === 0) return '';
  if (digits.length < 10) return '';  // still typing, no error yet
  if (!digits.startsWith('09') && !digits.startsWith('07')) {
    return lang === 'am'
      ? '❌ 09... (Ethiotelecom) ወይም 07... (Safaricom) ብቻ'
      : '❌ Must start with 09 (Ethiotelecom) or 07 (Safaricom)';
  }
  return '';
}

function getCarrierName(digits) {
  if (digits.startsWith('09')) return 'Ethiotelecom';
  if (digits.startsWith('07')) return 'Safaricom Ethiopia';
  return '';
}

/**
 * Convert phone → fake email for Supabase Auth storage.
 * e.g. "0912345678" → "0912345678@hagere.local"
 */
function phoneToEmail(digits) {
  return `${digits}@hagere.local`;
}

function pinToPassword(pin) {
  return `pin_${pin}_hv`;
}

function formatPhoneDisplay(digits) {
  // Format: 09x xxx xxxx or 07x xxx xxxx
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

// ── Floating circles background ───────────────────────────────────────────────
function Circles() {
  return (
    <div className="auth-circles" aria-hidden="true">
      <span className="circle c1" /><span className="circle c2" />
      <span className="circle c3" /><span className="circle c4" />
    </div>
  );
}

// ── Big number pad ────────────────────────────────────────────────────────────
function NumPad({ value, onChange, maxLen = 4, disabled }) {
  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  const press = (d) => {
    if (disabled) return;
    if (d === '⌫') { onChange(value.slice(0, -1)); return; }
    if (d === '')  return;
    if (value.length < maxLen) onChange(value + d);
  };

  return (
    <div className="numpad">
      {digits.map((d, i) => (
        <button
          key={i}
          type="button"
          className={`numpad-btn ${d === '⌫' ? 'numpad-del' : ''} ${d === '' ? 'numpad-empty' : ''}`}
          onClick={() => press(d)}
          disabled={disabled || d === ''}
          aria-label={d === '⌫' ? 'Delete' : d}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

// ── PIN dots display ──────────────────────────────────────────────────────────
function PinDots({ value, total = 4 }) {
  return (
    <div className="pin-dots">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`pin-dot ${i < value.length ? 'filled' : ''}`} />
      ))}
    </div>
  );
}

// ── Phone input step ──────────────────────────────────────────────────────────
function PhoneStep({ lang, phone, onChange }) {
  const digits = phone.replace(/\D/g, '');
  const isValid   = isValidEthiopianPhone(digits);
  const phoneError = getPhoneError(digits, lang);
  const carrier    = digits.length >= 2 ? getCarrierName(digits) : '';

  const press = (d) => {
    if (d === '⌫') { onChange(digits.slice(0, -1)); return; }
    if (d === '')  return;
    if (digits.length < 10) onChange(digits + d);
  };

  const padDigits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div className="auth-step">
      <div className="auth-logo">📱</div>
      <h2 className="step-title">
        {lang === 'am' ? 'ስልክ ቁጥርዎን ያስገቡ' : 'Enter your phone number'}
      </h2>
      <p className="step-hint">
        {lang === 'am'
          ? 'Ethiotelecom: 0912345678 | Safaricom: 0712345678'
          : 'Ethiotelecom: 0912345678  |  Safaricom: 0712345678'}
      </p>

      {/* Phone display — no +251 prefix */}
      <div className={`phone-display ${isValid ? 'phone-valid' : ''} ${phoneError ? 'phone-invalid' : ''}`}>
        <span className="phone-number">
          {digits.length > 0
            ? formatPhoneDisplay(digits)
            : <span className="phone-placeholder">09_ ___ ____</span>}
        </span>
        {carrier && <span className="carrier-badge">{carrier}</span>}
      </div>

      {/* Digit count */}
      <p className="phone-count">
        {digits.length} / 10
        {isValid && <span className="phone-ok"> ✓</span>}
      </p>

      {/* Validation error shown only when 10 digits entered and invalid */}
      {phoneError && <p className="phone-error-msg">{phoneError}</p>}

      {/* Number pad */}
      <div className="numpad">
        {padDigits.map((d, i) => (
          <button
            key={i}
            type="button"
            className={`numpad-btn ${d === '⌫' ? 'numpad-del' : ''} ${d === '' ? 'numpad-empty' : ''}`}
            onClick={() => press(d)}
            disabled={d === ''}
            aria-label={d === '⌫' ? 'Delete' : d}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── PIN step ──────────────────────────────────────────────────────────────────
function PinStep({ lang, pin, onChange, isConfirm = false, confirmPin = '' }) {
  return (
    <div className="auth-step">
      <div className="auth-logo">{isConfirm ? '🔒' : '🔑'}</div>
      <h2 className="step-title">
        {isConfirm
          ? (lang === 'am' ? 'PIN ዳግም ያረጋግጡ' : 'Confirm your PIN')
          : (lang === 'am' ? '4-ዲጂት PIN ይምረጡ' : 'Choose a 4-digit PIN')}
      </h2>
      <p className="step-hint">
        {lang === 'am'
          ? (isConfirm ? 'PIN ዳግም ያስገቡ' : 'ቀላሉ — እንደ ATM ቁጥርዎ')
          : (isConfirm ? 'Re-enter your PIN' : 'Simple — like your ATM PIN')}
      </p>

      <PinDots value={pin} total={4} />

      <NumPad
        value={pin}
        onChange={onChange}
        maxLen={4}
      />

      {/* Mismatch warning */}
      {isConfirm && pin.length === 4 && pin !== confirmPin && (
        <p className="pin-error">
          {lang === 'am' ? '❌ PIN አይዛመድም' : '❌ PINs do not match'}
        </p>
      )}
    </div>
  );
}

// ── Name step (signup only) ───────────────────────────────────────────────────
function NameStep({ lang, name, shopName, onName, onShop }) {
  return (
    <div className="auth-step">
      <div className="auth-logo">👤</div>
      <h2 className="step-title">
        {lang === 'am' ? 'ስምዎን ያስገቡ' : 'Tell us your name'}
      </h2>

      <div className="name-inputs">
        <div className="name-field">
          <label>{lang === 'am' ? 'ሙሉ ስም' : 'Your Name'} *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder={lang === 'am' ? 'ለምሳሌ፦ አልማዝ ተሰማ' : 'e.g. Almaz Tesema'}
            dir="auto"
            autoFocus
          />
        </div>
        <div className="name-field">
          <label>{lang === 'am' ? 'የሱቅ ስም (አማራጭ)' : 'Shop Name (optional)'}</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => onShop(e.target.value)}
            placeholder={lang === 'am' ? 'ለምሳሌ፦ ሀጌሬ ልብስ ቤት' : 'e.g. Hagere Boutique'}
            dir="auto"
          />
        </div>
      </div>
    </div>
  );
}

// ── Progress dots ─────────────────────────────────────────────────────────────
function Steps({ current, total }) {
  return (
    <div className="auth-steps">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`auth-step-dot ${i <= current ? 'active' : ''}`} />
      ))}
    </div>
  );
}

// ── Sign-in flow ──────────────────────────────────────────────────────────────
function SignInFlow({ lang, onSuccess, onSwitch, signIn }) {
  const [step,    setStep]    = useState(0); // 0=phone, 1=pin
  const [phone,   setPhone]   = useState('');
  const [pin,     setPin]     = useState('');
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');

  const phoneDigits = phone.replace(/\D/g, '');
  const canNextPhone = isValidEthiopianPhone(phoneDigits);
  const canSubmit    = pin.length === 4;

  const handleNext = () => { setErr(''); setPin(''); setStep(1); };

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setErr('');
    try {
      await signIn({ email: phoneToEmail(phoneDigits), password: pinToPassword(pin) });
    } catch {
      setErr(lang === 'am' ? '❌ ስልክ ቁጥር ወይም PIN ትክክል አይደለም' : '❌ Wrong phone number or PIN');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when PIN is complete
  const handlePinChange = (v) => {
    setPin(v);
    if (v.length === 4) setTimeout(() => handleLoginWithPin(v), 300);
  };

  const handleLoginWithPin = async (p) => {
    setLoading(true);
    setErr('');
    try {
      await signIn({ email: phoneToEmail(phoneDigits), password: pinToPassword(p) });
      onSuccess();
    } catch {
      setErr(lang === 'am' ? '❌ ስልክ ቁጥር ወይም PIN ትክክል አይደለም' : '❌ Wrong phone number or PIN');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-flow">
      <Steps current={step} total={2} />

      {step === 0 && (
        <>
          <PhoneStep lang={lang} phone={phone} onChange={setPhone} />
          <button
            type="button"
            className="auth-next-btn"
            onClick={handleNext}
            disabled={!canNextPhone}
          >
            {lang === 'am' ? 'ቀጥል →' : 'Next →'}
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <PinStep lang={lang} pin={pin} onChange={handlePinChange} />
          {loading && <p className="auth-loading">…</p>}
          {err && <p className="auth-error">{err}</p>}
          <button type="button" className="auth-back-btn" onClick={() => { setStep(0); setPin(''); setErr(''); }}>
            ← {lang === 'am' ? 'ተመለስ' : 'Back'}
          </button>
        </>
      )}

      <p className="auth-switch-row">
        {lang === 'am' ? 'አካውንት የለዎትም?' : "Don't have an account?"}{' '}
        <button type="button" className="auth-link" onClick={onSwitch}>
          {lang === 'am' ? 'ይመዝገቡ' : 'Sign up'}
        </button>
      </p>
    </div>
  );
}

// ── Sign-up flow ──────────────────────────────────────────────────────────────
function SignUpFlow({ lang, onSuccess, onSwitch, signUp }) {
  const [step,       setStep]       = useState(0); // 0=phone, 1=name, 2=pin, 3=confirm
  const [phone,      setPhone]      = useState('');
  const [name,       setName]       = useState('');
  const [shopName,   setShopName]   = useState('');
  const [pin,        setPin]        = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [err,        setErr]        = useState('');

  const phoneDigits = phone.replace(/\D/g, '');

  const next = () => { setErr(''); setStep((s) => s + 1); };
  const back = () => { setErr(''); setStep((s) => s - 1); };

  // Auto-advance PIN step when 4 digits entered
  const handlePinChange = (v) => {
    setPin(v);
    if (v.length === 4) setTimeout(() => { setStep(3); }, 300);
  };

  const handleConfirmChange = (v) => {
    setConfirmPin(v);
    if (v.length === 4) setTimeout(() => handleRegister(v), 300);
  };

  const handleRegister = async (cp = confirmPin) => {
    if (pin !== cp) { setErr(lang === 'am' ? '❌ PIN አይዛመድም' : '❌ PINs do not match'); setConfirmPin(''); return; }
    setLoading(true);
    setErr('');
    try {
      await signUp({
        email:    phoneToEmail(phoneDigits),
        password: pinToPassword(pin),
        fullName: name.trim() || phoneDigits,
        shopName: shopName.trim() || name.trim() || 'የእኔ ሱቅ',
      });
      onSuccess();
    } catch (ex) {
      const msg = ex.message?.includes('already') || ex.message?.includes('exists')
        ? (lang === 'am' ? '❌ ይህ ስልክ ቁጥር አስቀድሞ ተመዝግቧል' : '❌ This phone number is already registered')
        : (lang === 'am' ? '❌ ስህተት ተፈጥሯል — እንደገና ሞክር' : '❌ Something went wrong — try again');
      setErr(msg);
      setConfirmPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-flow">
      <Steps current={step} total={4} />

      {step === 0 && (
        <>
          <PhoneStep lang={lang} phone={phone} onChange={setPhone} />
          <button
            type="button" className="auth-next-btn"
            onClick={next} disabled={!isValidEthiopianPhone(phoneDigits)}
          >
            {lang === 'am' ? 'ቀጥል →' : 'Next →'}
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <NameStep lang={lang} name={name} shopName={shopName} onName={setName} onShop={setShopName} />
          <button type="button" className="auth-next-btn" onClick={next} disabled={!name.trim()}>
            {lang === 'am' ? 'ቀጥል →' : 'Next →'}
          </button>
          <button type="button" className="auth-back-btn" onClick={back}>← {lang === 'am' ? 'ተመለስ' : 'Back'}</button>
        </>
      )}

      {step === 2 && (
        <>
          <PinStep lang={lang} pin={pin} onChange={handlePinChange} />
          <button type="button" className="auth-back-btn" onClick={() => { back(); setPin(''); }}>
            ← {lang === 'am' ? 'ተመለስ' : 'Back'}
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <PinStep lang={lang} pin={confirmPin} onChange={handleConfirmChange} isConfirm confirmPin={pin} />
          {loading && <p className="auth-loading">…</p>}
          {err && <p className="auth-error">{err}</p>}
          <button type="button" className="auth-back-btn" onClick={() => { back(); setConfirmPin(''); setErr(''); }}>
            ← {lang === 'am' ? 'ተመለስ' : 'Back'}
          </button>
        </>
      )}

      <p className="auth-switch-row">
        {lang === 'am' ? 'አካውንት አለዎ?' : 'Already have an account?'}{' '}
        <button type="button" className="auth-link" onClick={onSwitch}>
          {lang === 'am' ? 'ይግቡ' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}

// ── Main AuthPage ─────────────────────────────────────────────────────────────
export function AuthPage({ onAuthSuccess, onBack }) {
  const [mode, setMode] = useState('login');
  const [lang, setLang] = useState('am');
  const { signIn, signUp } = useAuth();

  return (
    <div className="auth-page">
      <Circles />

      {/* Top bar: back button (left) + language switcher (right) */}
      <div className="auth-top-bar">
        {onBack ? (
          <button type="button" className="auth-back-home" onClick={onBack}>
            ← {lang === 'am' ? 'ወደ ዋና ገጽ' : 'Home'}
          </button>
        ) : <span />}
        <div className="auth-lang">
          <LanguageSwitcher lang={lang} onChange={setLang} />
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-card-strip" />
        <div className="auth-card-header">
          <h1 className="auth-app-name">HAGERE VOICE 🎤</h1>
          <p className="auth-app-sub">
            {lang === 'am' ? 'የእቃ ዝርዝር — በድምጽ' : 'Voice Inventory Assistant'}
          </p>
        </div>

        {mode === 'login'
          ? <SignInFlow lang={lang} onSuccess={onAuthSuccess} onSwitch={() => setMode('signup')} signIn={signIn} />
          : <SignUpFlow lang={lang} onSuccess={onAuthSuccess} onSwitch={() => setMode('login')} signUp={signUp} />
        }
      </div>

      <p className="auth-brand">
        🇪🇹 {lang === 'am' ? 'ለኢትዮጵያ ሴት አርቲዛኖች' : 'Built for Ethiopian women artisans'}
      </p>
    </div>
  );
}
