import { useState } from 'react';
import {
  CLASSES,
  CLASS_DISPLAY,
  CLASS_ICONS,
  CLASS_DESCRIPTIONS,
  GENDERS,
  GENDER_DISPLAY,
  GENDER_ICONS,
} from '../utils/gameLogic';

export default function Onboarding({ onSetup }) {
  const [step, setStep]               = useState(1); // 1: name, 2: gender, 3: class
  const [characterName, setName]      = useState('');
  const [gender, setGender]           = useState('');
  const [characterClass, setClass]    = useState('');
  const [nameError, setNameError]     = useState('');
  const [entering, setEntering]       = useState(false);

  const handleNameNext = () => {
    const trimmed = characterName.trim();
    if (!trimmed) {
      setNameError('Your hero needs a name, adventurer.');
      return;
    }
    if (trimmed.length > 20) {
      setNameError('Name must be 20 characters or fewer.');
      return;
    }
    setNameError('');
    setName(trimmed);
    setStep(2);
  };

  const handleGenderNext = () => {
    if (!gender) return;
    setStep(3);
  };

  const handleBegin = () => {
    if (!characterClass) return;
    setEntering(true);
    setTimeout(() => onSetup(characterName, gender, characterClass), 600);
  };

  return (
    <div className="app-container bg-void bg-texture min-h-screen flex flex-col relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Header */}
      <div className="pt-12 pb-6 text-center relative">
        <div className="inline-block mb-2">
          <span className="text-4xl">⚔️</span>
        </div>
        <h1
          className="font-cinzel text-4xl font-black tracking-widest text-gold-glow animate-pulse-gold"
          style={{ letterSpacing: '0.15em' }}
        >
          QUEST LOG
        </h1>
        <p className="font-rajdhani text-gold/50 text-sm tracking-[0.3em] mt-1 uppercase">
          Begin Your Legend
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              s === step
                ? 'w-6 bg-gold shadow-gold'
                : s < step
                ? 'bg-gold/50'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Step 1 — Name */}
      {step === 1 && (
        <div className="flex-1 flex flex-col px-6 animate-slide-up">
          <div className="mb-8 text-center">
            <h2 className="font-cinzel text-xl font-bold text-gold mb-1">Hero Name</h2>
            <p className="font-rajdhani text-white/40 text-sm">What shall adventurers call you?</p>
          </div>

          <div className="rune-border rounded-lg p-6 bg-abyss/80 mb-6">
            <input
              type="text"
              value={characterName}
              onChange={e => { setName(e.target.value); setNameError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleNameNext()}
              placeholder="Enter your name..."
              maxLength={20}
              autoFocus
              className="quest-input w-full rounded-lg px-4 py-3 text-lg text-center font-rajdhani font-semibold"
            />
            {nameError && (
              <p className="text-red-400 text-xs font-rajdhani mt-2 text-center">{nameError}</p>
            )}
            <div className="divider-rune mt-4">
              <span className="font-cinzel text-[10px]">IDENTITY</span>
            </div>
          </div>

          <button
            onClick={handleNameNext}
            className="btn-gold rounded-lg py-3 px-6 text-sm tracking-widest w-full"
          >
            CONTINUE
          </button>
        </div>
      )}

      {/* Step 2 — Gender */}
      {step === 2 && (
        <div className="flex-1 flex flex-col px-6 animate-slide-up">
          <div className="mb-8 text-center">
            <h2 className="font-cinzel text-xl font-bold text-gold mb-1">
              Choose Gender
            </h2>
            <p className="font-rajdhani text-white/40 text-sm">
              This shapes your character's portrait
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {GENDERS.map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`gender-card rounded-xl p-6 flex flex-col items-center gap-3 ${
                  gender === g ? 'selected' : ''
                }`}
              >
                <span className="text-5xl font-cinzel text-gold/80 leading-none">
                  {GENDER_ICONS[g]}
                </span>
                <span className="font-cinzel text-sm font-bold text-gold tracking-wider uppercase">
                  {GENDER_DISPLAY[g]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="btn-ghost rounded-lg py-3 px-4 text-sm flex-shrink-0"
            >
              ← BACK
            </button>
            <button
              onClick={handleGenderNext}
              disabled={!gender}
              className={`btn-gold rounded-lg py-3 px-6 text-sm tracking-widest flex-1 ${
                !gender ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Class */}
      {step === 3 && (
        <div className="flex-1 flex flex-col px-6 animate-slide-up">
          <div className="mb-6 text-center">
            <h2 className="font-cinzel text-xl font-bold text-gold mb-1">Choose Class</h2>
            <p className="font-rajdhani text-white/40 text-sm">
              Your class determines your portrait evolution
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {CLASSES.map(cls => (
              <button
                key={cls}
                onClick={() => setClass(cls)}
                className={`class-card rounded-lg p-3 flex flex-col items-center gap-1.5 ${
                  characterClass === cls ? 'selected' : ''
                }`}
              >
                <span className="text-2xl">{CLASS_ICONS[cls]}</span>
                <span className="font-cinzel text-[10px] font-bold text-gold/80 tracking-wide uppercase leading-tight">
                  {CLASS_DISPLAY[cls]}
                </span>
                <span className="font-rajdhani text-[9px] text-white/30 leading-tight text-center">
                  {CLASS_DESCRIPTIONS[cls]}
                </span>
              </button>
            ))}
          </div>

          {/* Selected class banner */}
          {characterClass && (
            <div className="mb-4 text-center py-2 rounded-lg bg-stone/50 border border-gold/20">
              <span className="font-rajdhani text-sm text-gold/70">
                {CLASS_ICONS[characterClass]}&nbsp;&nbsp;
                <span className="font-cinzel font-bold text-gold">
                  {CLASS_DISPLAY[characterClass]}
                </span>
                &nbsp;&nbsp;selected
              </span>
            </div>
          )}

          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setStep(2)}
              className="btn-ghost rounded-lg py-3 px-4 text-sm flex-shrink-0"
            >
              ← BACK
            </button>
            <button
              onClick={handleBegin}
              disabled={!characterClass || entering}
              className={`btn-gold rounded-lg py-3 px-6 text-sm tracking-widest flex-1 ${
                !characterClass || entering ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              {entering ? 'ENTERING...' : 'BEGIN JOURNEY'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom lore text */}
      <div className="pb-8 text-center">
        <p className="font-cinzel text-[10px] text-white/10 tracking-[0.2em]">
          ✦ YOUR LEGEND BEGINS TODAY ✦
        </p>
      </div>
    </div>
  );
}
