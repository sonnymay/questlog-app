// ── Constants ─────────────────────────────────────────────────────────────────

export const CLASSES = [
  'swordsman',
  'archer',
  'acolyte',
  'thief',
  'merchant',
  'mage',
  'assassin',
  'paladin',
  'bard',
];

export const CLASS_DISPLAY = {
  swordsman: 'Swordsman',
  archer:    'Archer',
  acolyte:   'Acolyte',
  thief:     'Thief',
  merchant:  'Merchant',
  mage:      'Mage',
  assassin:  'Assassin',
  paladin:   'Paladin',
  bard:      'Bard',
};

export const CLASS_ICONS = {
  swordsman: '⚔️',
  archer:    '🏹',
  acolyte:   '✨',
  thief:     '🗡️',
  merchant:  '💰',
  mage:      '🔮',
  assassin:  '🌑',
  paladin:   '🛡️',
  bard:      '🎵',
};

// Thematic description shown on class selection
export const CLASS_DESCRIPTIONS = {
  swordsman: 'Master of blades',
  archer:    'Swift and precise',
  acolyte:   'Wielder of light',
  thief:     'Shadow and cunning',
  merchant:  'Gold and fortune',
  mage:      'Arcane power',
  assassin:  'Death in darkness',
  paladin:   'Holy vanguard',
  bard:      'Song of legends',
};

export const GENDERS = ['male', 'female'];

export const GENDER_DISPLAY = {
  male:   'Male',
  female: 'Female',
};

export const GENDER_ICONS = {
  male:   '♂',
  female: '♀',
};

// ── Level names ───────────────────────────────────────────────────────────────

export const getLevelName = (level) => {
  if (level === 100) return 'Transcendent';
  if (level >= 91)   return 'S-Rank';
  if (level >= 81)   return 'Legendary';
  if (level >= 71)   return 'Veteran';
  if (level >= 61)   return 'Elite';
  if (level >= 51)   return 'Warlord';
  if (level >= 41)   return 'Champion';
  if (level >= 31)   return 'Knight';
  if (level >= 21)   return 'Hunter';
  if (level >= 11)   return 'Scout';
  if (level >= 6)    return 'Apprentice';
  return 'Novice';
};

// Roman numerals for level display flavor
export const getLevelRoman = (level) => {
  if (level <= 0 || level > 100) return level.toString();
  const val = [100,90,50,40,10,9,5,4,1];
  const sym = ['C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  let n = level;
  for (let i = 0; i < val.length; i++) {
    while (n >= val[i]) {
      result += sym[i];
      n -= val[i];
    }
  }
  return result;
};

// ── Quest-based leveling ──────────────────────────────────────────────────────

/** Number of completed quest sets required to gain one level */
export const QUESTS_PER_LEVEL = 1;

/** Process a completed quest set, returning new questsTowardLevel and level */
export const processQuestCompletion = (questsTowardLevel, currentLevel) => {
  if (currentLevel >= 100) return { newQuestsTowardLevel: 0, newLevel: 100, levelsGained: 0 };

  const next = questsTowardLevel + 1;
  if (next >= QUESTS_PER_LEVEL) {
    const newLevel = Math.min(100, currentLevel + 1);
    return { newQuestsTowardLevel: 0, newLevel, levelsGained: 1 };
  }
  return { newQuestsTowardLevel: next, newLevel: currentLevel, levelsGained: 0 };
};

// ── Portrait URL ──────────────────────────────────────────────────────────────
//
// Priority:
//   1. VITE_PORTRAIT_BASE_URL  — any public host, e.g. https://cdn.example.com/portraits
//   2. VITE_SUPABASE_URL       — auto-builds the Supabase Storage path
//
// Expected file layout (same for any host):
//   {base}/{gender}/{class}/{level}.png
//   e.g. /male/swordsman/1.png

const PORTRAIT_BASE = (() => {
  const custom = import.meta.env.VITE_PORTRAIT_BASE_URL;
  if (custom) return custom.replace(/\/$/, '');

  const supabase = import.meta.env.VITE_SUPABASE_URL;
  if (supabase) return `${supabase}/storage/v1/object/public/character-portraits`;

  return null;
})();

const PORTRAIT_TIER = (level) => {
  if (level >= 100) return 100;
  if (level >= 91)  return 91;
  if (level >= 81)  return 81;
  if (level >= 71)  return 71;
  if (level >= 61)  return 61;
  if (level >= 51)  return 51;
  if (level >= 41)  return 41;
  if (level >= 31)  return 31;
  if (level >= 21)  return 21;
  if (level >= 11)  return 11;
  if (level >= 6)   return 6;
  return 1;
};

export const getPortraitUrl = (_unused, gender, characterClass, level) => {
  if (!PORTRAIT_BASE) return null;
  const tier = PORTRAIT_TIER(level);
  return `${PORTRAIT_BASE}/${gender.toLowerCase()}/${characterClass.toLowerCase()}/${tier}.png`;
};

// ── Date utils ────────────────────────────────────────────────────────────────

export const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// ── Quest progress bar percentage ─────────────────────────────────────────────

export const getQuestPercent = (questsTowardLevel) => {
  return Math.min(100, (questsTowardLevel / QUESTS_PER_LEVEL) * 100);
};
