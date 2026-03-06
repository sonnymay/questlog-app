import { getQuestPercent, QUESTS_PER_LEVEL } from '../utils/gameLogic';

export default function XPBar({ questsTowardLevel, currentLevel }) {
  const percent    = getQuestPercent(questsTowardLevel);
  const isMaxLevel = currentLevel >= 100;

  return (
    <div className="w-full">
      {/* Progress label */}
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-rajdhani text-[10px] text-white/30 tracking-wide uppercase">
          {isMaxLevel ? 'MAX LEVEL' : 'Progress'}
        </span>
        {!isMaxLevel && (
          <span className="font-rajdhani text-[10px] tracking-wide" style={{ color: '#f0c04099' }}>
            {questsTowardLevel} / {QUESTS_PER_LEVEL} to next level
          </span>
        )}
      </div>

      {/* Bar track */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          height:     '10px',
          background: '#0d0d1a',
          border:     '1px solid rgba(124,58,237,0.2)',
          boxShadow:  'inset 0 1px 3px rgba(0,0,0,0.8)',
        }}
      >
        {/* Fill — all styling inline so it can't be overridden by stale CSS */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700"
          style={{
            width:      `${percent}%`,
            background: 'linear-gradient(90deg, #b8860b, #f0c040, #fde68a)',
            boxShadow:  percent > 0
              ? '0 0 10px rgba(240,192,64,0.7), 0 0 22px rgba(240,192,64,0.3)'
              : 'none',
          }}
        />

        {/* Shine overlay */}
        <div
          className="absolute top-0 left-0 right-0 rounded-full pointer-events-none"
          style={{
            height:     '45%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
          }}
        />
      </div>
    </div>
  );
}
