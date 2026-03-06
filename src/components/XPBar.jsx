import { getQuestPercent, QUESTS_PER_LEVEL } from '../utils/gameLogic';

export default function XPBar({ questsTowardLevel, currentLevel }) {
  const percent = getQuestPercent(questsTowardLevel);
  const isMaxLevel = currentLevel >= 100;

  return (
    <div className="w-full">
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

        {/* Shine */}
        <div
          className="absolute top-0 left-0 right-0 h-[40%] rounded-full pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)' }}
        />
      </div>
    </div>
  );
}
