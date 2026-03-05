import { useEffect, useState } from 'react';
import { getLevelName, CLASS_ICONS, CLASS_DISPLAY } from '../utils/gameLogic';
import CharacterPortrait from './CharacterPortrait';

export default function LevelUpOverlay({ event, gender, characterClass, onDismiss }) {
  const { toLevel } = event;
  const levelName = getLevelName(toLevel);
  const classIcon = CLASS_ICONS[characterClass] || '';
  const classDisplay = CLASS_DISPLAY[characterClass] || characterClass;

  const [showFlash, setShowFlash]     = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [particles, setParticles]     = useState([]);

  useEffect(() => {
    // Flash then reveal content
    const t1 = setTimeout(() => setShowFlash(false), 600);
    const t2 = setTimeout(() => setShowContent(true), 400);

    // Generate sparkle particles
    const pts = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 1,
      duration: Math.random() * 1.5 + 1,
    }));
    setParticles(pts);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const isMaxLevel = toLevel >= 100;

  return (
    <>
      {/* White flash */}
      {showFlash && <div className="levelup-flash" />}

      {/* Main overlay */}
      <div
        className="levelup-overlay"
        onClick={onDismiss}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onDismiss()}
        aria-label="Dismiss level up"
      >
        {/* Sparkle particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.id % 3 === 0 ? '#f0c040' : p.id % 3 === 1 ? '#a78bfa' : '#60a5fa',
              opacity: 0,
              animation: `xpFloat ${p.duration}s ${p.delay}s ease-out infinite`,
              boxShadow: `0 0 ${p.size * 2}px currentColor`,
            }}
          />
        ))}

        {/* Radial glow rings */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at center, rgba(124,58,237,0.25) 0%, transparent 70%)',
          }}
        />

        {showContent && (
          <div className="flex flex-col items-center gap-6 px-8 w-full max-w-sm animate-slide-up">
            {/* Crown icon */}
            <div className="text-5xl animate-pulse-gold">
              {isMaxLevel ? '👑' : '⬆️'}
            </div>

            {/* LEVEL UP text */}
            <div className="text-center">
              <div
                className="levelup-text text-5xl font-black tracking-[0.1em] mb-2"
                style={{ lineHeight: 1 }}
              >
                {isMaxLevel ? 'TRANSCENDENT' : 'LEVEL UP!'}
              </div>
              <div className="font-cinzel text-2xl font-bold text-white/80 tracking-widest">
                LEVEL {toLevel}
              </div>
            </div>

            {/* Level name badge */}
            <div
              className="rounded-full px-6 py-2"
              style={{
                background: 'linear-gradient(135deg, #1a1000, #2a1e00)',
                border: '1px solid rgba(240,192,64,0.5)',
                boxShadow: '0 0 20px rgba(240,192,64,0.3)',
              }}
            >
              <span className="font-cinzel text-gold font-bold tracking-widest text-sm">
                {levelName}
              </span>
            </div>

            {/* Character portrait */}
            <div className="w-36 h-36">
              <CharacterPortrait
                gender={gender}
                characterClass={characterClass}
                level={toLevel}
                levelName={levelName}
              />
            </div>

            {/* Class badge */}
            <div className="flex items-center gap-2">
              <span className="text-xl">{classIcon}</span>
              <span className="font-cinzel text-gold/60 text-sm tracking-widest uppercase">
                {classDisplay}
              </span>
            </div>

            {/* Divider */}
            <div className="divider-rune w-full">
              <span className="font-cinzel text-[9px] tracking-[0.3em]">POWER INCREASED</span>
            </div>

            {/* Dismiss hint */}
            <div className="text-center">
              <p className="font-rajdhani text-white/30 text-xs tracking-wider mb-2">
                Tap anywhere to continue
              </p>
              <button
                onClick={e => { e.stopPropagation(); onDismiss(); }}
                className="btn-gold rounded-lg px-8 py-2.5 text-xs tracking-[0.15em]"
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
