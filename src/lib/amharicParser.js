/**
 * Parses Amharic voice transcripts into inventory actions.
 * Handles flexible word order: "ሱሪ ሁለት ጨመር" AND "ሁለት ሱሪ ጨምር" AND "ጨምር ሱሪ ሁለት"
 * Also handles "ሸጥኩ" (I sold) as a subtract shortcut.
 */

export const AMHARIC_NUMBERS = {
  አንድ: 1,
  ሁለት: 2,
  ሶስት: 3,
  አራት: 4,
  አምስት: 5,
  ስድስት: 6,
  ሰባት: 7,
  ስምንት: 8,
  ዘጠኝ: 9,
  አስር: 10,
  አስራ: 10,
  'አስር አንድ':  11, 'አስራ አንድ':  11, አስራአንድ: 11,
  'አስር ሁለት':  12, 'አስራ ሁለት':  12, አስራሁለት: 12,
  'አስር ሶስት':  13, 'አስራ ሶስት':  13,
  'አስር አራት':  14, 'አስራ አራት':  14,
  'አስር አምስት': 15, 'አስራ አምስት': 15,
  'አስር ስድስት': 16, 'አስራ ስድስት': 16,
  'አስር ሰባት':  17, 'አስራ ሰባት':  17,
  'አስር ስምንት': 18, 'አስራ ስምንት': 18,
  'አስር ዘጠኝ':  19, 'አስራ ዘጠኝ':  19,
  ሃያ: 20, ሰላሳ: 30, አርባ: 40, ሃምሳ: 50,
};

export const ADD_KEYWORDS      = ['ጨመር', 'ጨምር', 'አክል', 'ጨምራ', 'ጨምሯል', 'add'];
export const SUBTRACT_KEYWORDS = ['ቀንስ', 'ቀንሳ', 'ቀንስር', 'አውርድ', 'subtract',
                                   // "ሸጥኩ" = I sold → subtract
                                   'ሸጥኩ', 'ሸጠ', 'ሸጡ', 'ሸጠኝ'];
export const SET_KEYWORDS      = ['ቀምር', 'አድርግ', 'set'];

// ── helpers ──────────────────────────────────────────────────────────────────

function parseQuantity(text) {
  const digitMatch = text.match(/(\d+)/);
  if (digitMatch) return parseInt(digitMatch[1], 10);

  // Compound numbers first (longest match)
  const compound = Object.entries(AMHARIC_NUMBERS)
    .filter(([k]) => k.includes(' '))
    .sort((a, b) => b[0].length - a[0].length);
  for (const [w, v] of compound) { if (text.includes(w)) return v; }

  // Single-word numbers
  for (const [w, v] of Object.entries(AMHARIC_NUMBERS)) {
    if (!w.includes(' ') && text.includes(w)) return v;
  }
  return 1;
}

function detectAction(text) {
  const lo = text.toLowerCase();
  if (ADD_KEYWORDS.some((k)      => text.includes(k) || lo.includes(k))) return 'add';
  if (SUBTRACT_KEYWORDS.some((k) => text.includes(k) || lo.includes(k))) return 'subtract';
  if (SET_KEYWORDS.some((k)      => text.includes(k) || lo.includes(k))) return 'set';
  return null;
}

function stripAll(text) {
  let s = text;
  for (const kw of [...ADD_KEYWORDS, ...SUBTRACT_KEYWORDS, ...SET_KEYWORDS]) {
    s = s.replace(new RegExp(kw, 'gi'), '');
  }
  // Compound numbers first
  const compound = Object.keys(AMHARIC_NUMBERS)
    .filter((k) => k.includes(' '))
    .sort((a, b) => b.length - a.length);
  for (const w of compound) { s = s.replace(new RegExp(w, 'g'), ''); }
  for (const w of Object.keys(AMHARIC_NUMBERS)) {
    if (!w.includes(' ')) s = s.replace(new RegExp(w, 'g'), '');
  }
  return s.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
}

// ── main export ───────────────────────────────────────────────────────────────

/**
 * Handles any word order:
 *   "ሱሪ ሁለት ጨመር"   ✓
 *   "ሁለት ሱሪ ጨምር"   ✓  (quantity before item)
 *   "ጨምር ሱሪ ሁለት"   ✓  (action first)
 *   "ሸጥኩ ቀሚስ ሦስት"  ✓  (sold shortcut)
 */
export function parseAmharicInventoryCommand(transcript) {
  const text = (transcript || '').trim();
  if (!text) return { action: null, itemName: '', quantity: 0, confidence: 'low', error: 'empty' };

  const action   = detectAction(text);
  const quantity = parseQuantity(text);
  const itemName = stripAll(text);

  if (!action)    return { action: null,  itemName, quantity, confidence: 'low', error: 'no_action' };
  if (!itemName)  return { action, itemName: '', quantity, confidence: 'low', error: 'no_item' };

  return { action, itemName, quantity, confidence: 'high' };
}

export const EXAMPLE_COMMANDS = [
  { am: 'ሱሪ ሁለት ጨመር',    en: 'Add 2 dresses' },
  { am: 'ቀሚስ አንድ ቀንስ',    en: 'Subtract 1 shirt' },
  { am: 'ሻማ አምስት ጨመር',   en: 'Add 5 scarves' },
  { am: 'ሸጥኩ ጫማ ሁለት',    en: 'Sold 2 shoes' },
];
