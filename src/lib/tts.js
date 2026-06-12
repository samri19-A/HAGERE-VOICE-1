/**
 * Feature 1 – Amharic text-to-speech (Web Speech API)
 * Speaks back a confirmation after every voice command.
 */

const AMHARIC_NUMBER_WORDS = {
  0: 'ዜሮ', 1: 'አንድ', 2: 'ሁለት', 3: 'ሶስት', 4: 'አራት', 5: 'አምስት',
  6: 'ስድስት', 7: 'ሰባት', 8: 'ስምንት', 9: 'ዘጠኝ', 10: 'አስር',
  11: 'አስራ አንድ', 12: 'አስራ ሁለት', 13: 'አስራ ሶስት', 14: 'አስራ አራት',
  15: 'አስራ አምስት', 16: 'አስራ ስድስት', 17: 'አስራ ሰባት', 18: 'አስራ ስምንት',
  19: 'አስራ ዘጠኝ', 20: 'ሃያ', 25: 'ሃያ አምስት', 30: 'ሰላሳ',
  40: 'አርባ', 50: 'ሃምሳ', 100: 'መቶ',
};

function numberToAmharic(n) {
  if (AMHARIC_NUMBER_WORDS[n]) return AMHARIC_NUMBER_WORDS[n];
  if (n < 20) return `አስራ ${AMHARIC_NUMBER_WORDS[n - 10] || n}`;
  if (n < 100) {
    const tens = Math.floor(n / 10) * 10;
    const ones = n % 10;
    return ones === 0
      ? (AMHARIC_NUMBER_WORDS[tens] || String(n))
      : `${AMHARIC_NUMBER_WORDS[tens] || tens} ${AMHARIC_NUMBER_WORDS[ones] || ones}`;
  }
  return String(n);
}

/**
 * Builds the Amharic confirmation sentence and speaks it.
 * e.g. "ሱሪ ሁለት ጨምሯል። አሁን አሥራ አራት አለ።"
 */
export function speakConfirmation({ action, itemName, quantityBefore, quantityAfter, lang = 'am' }) {
  if (!window.speechSynthesis) return;

  let text = '';

  if (lang === 'am') {
    const afterWord = numberToAmharic(quantityAfter);
    if (action === 'add') {
      text = `${itemName} ጨምሯል። አሁን ${afterWord} አለ።`;
    } else if (action === 'subtract') {
      text = `${itemName} ቀንሷል። አሁን ${afterWord} አለ።`;
    } else if (action === 'set') {
      text = `${itemName} ${afterWord} ሆኗል።`;
    } else {
      text = `${itemName} ተስተካክሏል።`;
    }
  } else {
    if (action === 'add')      text = `${itemName} added. Now ${quantityAfter}.`;
    else if (action === 'subtract') text = `${itemName} subtracted. Now ${quantityAfter}.`;
    else if (action === 'set') text = `${itemName} set to ${quantityAfter}.`;
    else                       text = `${itemName} updated.`;
  }

  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  // Try to find an Amharic voice; fall back gracefully
  const voices = window.speechSynthesis.getVoices();
  const amharic = voices.find((v) => v.lang === 'am-ET' || v.lang.startsWith('am'));
  if (amharic) utterance.voice = amharic;
  utterance.lang = lang === 'am' ? 'am-ET' : 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

/** Speak a simple Amharic error / warning */
export function speakError(message) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'am-ET';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
