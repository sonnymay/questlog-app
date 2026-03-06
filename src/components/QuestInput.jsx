import { useState } from 'react';

const QUEST_COUNT = 3;

const FLAVOR_LINES = [
  'Your legend grows, adventurer. What will you conquer today?',
  'The realm awaits your deeds. Declare your quests.',
  'Heroes are forged in the fires of daily trials.',
  'Three quests stand between you and glory.',
  'Rise, champion. The day demands your courage.',
  'Sharpen your resolve. Victory begins here.',
  'What battles will be sung of tonight?',
  'The chronicle of your deeds continues…',
  'Another dawn, another chance to forge your legacy.',
  'Steel your will and name your trials.',
];

// Stable per calendar day — feels curated, not random
function getDailyFlavorLine() {
  const dayOfYear = Math.floor(Date.now() / 86_400_000);
  return FLAVOR_LINES[dayOfYear % FLAVOR_LINES.length];
}

const PLACEHOLDER_QUESTS = [
  'Defeat 10 goblins in the dungeon...',
  'Deliver the ancient scroll...',
  'Gather enchanted herbs from the forest...',
  'Train sword techniques for 1 hour...',
  'Craft a healing potion...',
  'Explore the forgotten ruins...',
  "Complete the guild's daily request...",
  'Study the arcane spellbook...',
];

function getPlaceholder(index) {
  return PLACEHOLDER_QUESTS[(index * 3) % PLACEHOLDER_QUESTS.length];
}

export default function QuestInput({ onStart, prefill = [] }) {
  const [tasks, setTasks] = useState(() => {
    const init = ['', '', ''];
    prefill.forEach((text, i) => { if (i < 3) init[i] = text; });
    return init;
  });
  const [errors,  setErrors]  = useState([false, false, false]);
  const [shaking, setShaking] = useState(false);

  const flavorLine = getDailyFlavorLine();

  const updateTask = (index, value) => {
    setTasks(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (errors[index]) {
      setErrors(prev => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = document.getElementById(`quest-input-${index + 1}`);
      if (next) {
        next.focus();
      } else {
        handleAccept();
      }
    }
  };

  const handleAccept = () => {
    const newErrors = tasks.map(t => !t.trim());
    if (newErrors.some(Boolean)) {
      setErrors(newErrors);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    onStart(tasks);
  };

  const filledCount = tasks.filter(t => t.trim()).length;

  return (
    <div className="animate-slide-up">
      {/* Section header */}
      <div className="mb-4">
        <div className="divider-rune mb-3">
          <span className="font-cinzel text-[10px] tracking-[0.3em]">ACCEPT QUESTS</span>
        </div>
        <p className="font-rajdhani text-white/40 text-xs text-center tracking-wide italic">
          {flavorLine}
        </p>
      </div>

      {/* Task inputs */}
      <div className="space-y-3 mb-5">
        {tasks.map((task, i) => (
          <div key={i} className="relative">
            {/* Quest number / checkmark badge */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{
                  background: errors[i]
                    ? 'rgba(220,38,38,0.3)'
                    : task.trim()
                    ? 'rgba(34,197,94,0.2)'
                    : 'rgba(240,192,64,0.1)',
                  border: errors[i]
                    ? '1px solid rgba(220,38,38,0.5)'
                    : task.trim()
                    ? '1px solid rgba(34,197,94,0.4)'
                    : '1px solid rgba(240,192,64,0.2)',
                }}
              >
                <span
                  className="font-cinzel text-[10px] font-bold"
                  style={{
                    color: errors[i]
                      ? '#f87171'
                      : task.trim()
                      ? '#4ade80'
                      : '#f0c04060',
                  }}
                >
                  {task.trim() ? '✓' : i + 1}
                </span>
              </div>
            </div>

            <input
              id={`quest-input-${i}`}
              type="text"
              value={task}
              onChange={e => updateTask(i, e.target.value)}
              onKeyDown={e => handleKeyDown(e, i)}
              placeholder={getPlaceholder(i)}
              maxLength={80}
              className={`quest-input w-full rounded-lg pl-12 pr-4 py-3.5 text-sm font-rajdhani font-medium ${
                shaking && errors[i] ? 'animate-shake' : ''
              }`}
            />

            {errors[i] && (
              <p className="text-red-400/80 text-[10px] font-rajdhani mt-1 pl-3">
                This quest cannot be empty
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-5">
        {tasks.map((t, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              t.trim() ? 'bg-gold/60' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Accept button */}
      <button
        onClick={handleAccept}
        className={`btn-gold w-full rounded-lg py-4 text-sm tracking-[0.15em] transition-all ${
          filledCount < QUEST_COUNT ? 'opacity-60' : ''
        }`}
      >
        ⚔ ACCEPT QUESTS
        {filledCount > 0 && filledCount < QUEST_COUNT && (
          <span className="ml-2 font-rajdhani font-normal text-xs opacity-70">
            ({filledCount}/{QUEST_COUNT})
          </span>
        )}
      </button>
    </div>
  );
}
