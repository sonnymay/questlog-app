import { getXPPercent, getXPNeeded } from '../utils/gameLogic';

export default function XPBar({ currentXP, currentLevel }) {
  const percent = getXPPercent(currentXP, currentLevel);
  const xpNeeded = getXPNeeded(currentLevel);
  const isMaxLevel = currentLevel >= 100;

  return (
    <div className="w-full">
      {/* Labels */}
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-rajdhani text-xs text-white/40 tracking-wider">
          {isMaxLevel ? 'MAX LEVEL' : 'EXPERIENCE'}
        </span>
        <span className="font-rajdhani text-xs text-gold/60 font-semibold">
          {isMaxLevel
            ? '✦ TRANSCENDENT ✦'
            : `${currentXP.toLocaleString()} / ${xpNeeded.toLocaleString()} XP`}
        </span>
      </div>

      {/* Bar track */}
      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{
          background: '#0d0d1a',
          border: '1px solid rgba(124,58,237,0.2)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
        }}
      >
        {/* Fill */}
        <div
          className="absolute left-0 top-0 bottom-0 xp-bar-fill rounded-full"
          style={{ width: `${percent}%` }}
        />

        {/* Segment markers (every 25%) */}
        {!isMaxLevel && [25, 50, 75].map(pct => (
          <div
            key={pct}
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${pct}%`,
              background: 'rgba(0,0,0,0.4)',
            }}
          />
        ))}

        {/* Shine */}
        <div
          className="absolute top-0 left-0 right-0 h-[40%] rounded-full pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)' }}
        />
      </div>

      {/* XP to next level hint */}
      {!isMaxLevel && (
        <div className="mt-1 text-right">
          <span className="font-rajdhani text-[10px] text-white/20">
            {(xpNeeded - currentXP).toLocaleString()} XP to next level
          </span>
        </div>
      )}
    </div>
  );
}
