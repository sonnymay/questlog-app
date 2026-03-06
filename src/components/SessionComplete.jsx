import { useState, useEffect, useMemo } from 'react';

// Stable star positions computed once per mount
function useStars(count) {
  return useMemo(() => (
    Array.from({ length: count }, (_, i) => ({
      id: i,
      size: (((i * 7) % 3) + 1),
      left: ((i * 37 + 11) % 100),
      top:  ((i * 53 + 7)  % 100),
      opacity: (((i * 13) % 6) + 2) / 10,
      delay: ((i * 3) % 20) / 10,
    }))
  ), [count]);
}

export default function SessionComplete({ currentLevel, questsCompletedToday, hasBacklog, onContinue }) {
  const [visible, setVisible] = useState(false);
  const stars = useStars(24);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(6,6,12,0.97)', backdropFilter: 'blur(12px)' }}
    >
      {/* Ambient stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full animate-pulse-gold"
            style={{
              width:  s.size + 'px',
              height: s.size + 'px',
              left:   s.left + '%',
              top:    s.top  + '%',
              opacity: s.opacity,
              background: '#f0c040',
              animationDelay: s.delay + 's',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-8 max-w-xs mx-auto w-full">

        {/* Sword icon */}
        <div
          className="text-6xl mb-5 block"
          style={{ filter: 'drop-shadow(0 0 24px rgba(240,192,64,0.7))' }}
        >
          &#x2694;&#xFE0F;
        </div>

        {/* Title */}
        <div className="divider-rune mb-4">
          <span className="font-cinzel text-[10px] tracking-[0.3em]">VICTORY</span>
        </div>

        <h1
          className="font-cinzel text-gold text-3xl font-black tracking-widest mb-3 leading-tight"
          style={{ textShadow: '0 0 40px rgba(240,192,64,0.45)' }}
        >
          SESSION<br />COMPLETE
        </h1>

        <p className="font-rajdhani text-white/45 text-sm tracking-wide mb-6 leading-relaxed">
          Your legend grows, adventurer.<br />
          The realm remembers your deeds.
        </p>

        {/* Stats */}
        <div className="flex gap-3 mb-8">
          <div
            className="flex-1 rounded-lg py-3 text-center"
            style={{
              background: 'rgba(34,197,94,0.08)',
              border:     '1px solid rgba(34,197,94,0.25)',
            }}
          >
            <div className="font-cinzel text-green-400 text-xl font-bold leading-none">
              {questsCompletedToday}
            </div>
            <div className="font-rajdhani text-white/30 text-[10px] uppercase tracking-wide mt-1">
              Sessions Today
            </div>
          </div>
          <div
            className="flex-1 rounded-lg py-3 text-center"
            style={{
              background: 'rgba(240,192,64,0.08)',
              border:     '1px solid rgba(240,192,64,0.25)',
            }}
          >
            <div className="font-cinzel text-gold text-xl font-bold leading-none">
              {currentLevel}
            </div>
            <div className="font-rajdhani text-white/30 text-[10px] uppercase tracking-wide mt-1">
              Level
            </div>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="btn-gold w-full rounded-lg py-4 text-sm tracking-[0.2em]"
        >
          {hasBacklog ? '\u2694 NEXT QUEST' : '\u2736 ONWARD'}
        </button>
      </div>
    </div>
  );
}
