import { useState } from 'react';

/**
 * Feature 4 – First-run onboarding: 3 Amharic slides
 * Shown only once; dismissed to localStorage.
 */

const SLIDES = [
  {
    emoji: '🎤',
    am: { title: 'እንኳን ደህና መጡ!', body: 'HAGERE VOICE — ድምጽዎን ይጠቀሙ። ምንም ጽሑፍ አያስፈልግም!' },
    en: { title: 'Welcome!',        body: 'HAGERE VOICE — use your voice. No typing needed!' },
  },
  {
    emoji: '📦',
    am: { title: 'ድምጽ ተናገሩ', body: 'ለምሳሌ፦ "ሱሪ ሁለት ጨምር" ወይም "ሸጥኩ ቀሚስ አንድ" — ብዛት ወዲያው ይቀየራል።' },
    en: { title: 'Speak a command', body: 'Example: "ሱሪ ሁለት ጨምር" (add 2 dresses) or "ሸጥኩ ቀሚስ አንድ" (sold 1 shirt).' },
  },
  {
    emoji: '✅',
    am: { title: 'ዝርዝሩ ይሻሻላል', body: 'ያውጠነቀቁ ዕቃዎች ቢኖሩ ⚠️ ምልክት ያሳያል። ለጓደኞች WhatsApp ይላኩ!' },
    en: { title: 'Inventory updates instantly', body: 'Low stock shows ⚠️. Share your stock via WhatsApp!' },
  },
];

const KEY = 'hagere_onboarding_done';

export function Onboarding({ lang, onDone }) {
  const [step, setStep] = useState(0);

  const finish = () => {
    localStorage.setItem(KEY, '1');
    onDone();
  };

  const slide = SLIDES[step];
  const copy  = slide[lang] || slide.en;
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="onboarding-backdrop">
      <div className="onboarding-card">
        {/* Progress dots */}
        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <span key={i} className={`dot ${i === step ? 'dot-active' : ''}`} />
          ))}
        </div>

        <div className="onboarding-emoji">{slide.emoji}</div>
        <h2 className="onboarding-title">{copy.title}</h2>
        <p  className="onboarding-body">{copy.body}</p>

        <div className="onboarding-actions">
          {step > 0 && (
            <button type="button" className="ob-back" onClick={() => setStep((s) => s - 1)}>
              {lang === 'am' ? '← ተመለስ' : '← Back'}
            </button>
          )}
          {isLast ? (
            <button type="button" className="ob-start" onClick={finish}>
              {lang === 'am' ? 'ጀምር →' : 'Get Started →'}
            </button>
          ) : (
            <button type="button" className="ob-next" onClick={() => setStep((s) => s + 1)}>
              {lang === 'am' ? 'ቀጥል →' : 'Next →'}
            </button>
          )}
        </div>

        <button type="button" className="ob-skip" onClick={finish}>
          {lang === 'am' ? 'ዝለል' : 'Skip'}
        </button>
      </div>
    </div>
  );
}

export function shouldShowOnboarding() {
  return !localStorage.getItem(KEY);
}
