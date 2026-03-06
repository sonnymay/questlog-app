import { useState, useRef, useEffect } from 'react';

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

// Pick a stable flavor line per calendar day so it feels curated, not random
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

function randomPlaceholder(index) {
  return PLACEHOLDER_QUESTS[(index * 3) % PLACEHOLDER_QUESTS.length];
}

export default function QuestInput({ onStart, prefill = [], backlogQuests = [], onBacklogChange }) {
  // Initialise from prefill (populated when backlog has 1–2 items and auto-filled)
  const [tasks, setTasks] = useState(() => {
    const init = ['', '', ''];
    prefill.forEach((text, i) => { if (i < 3) init[i] = text; });
    return init;
  });
  const [errors,  setErrors]  = useState([false, false, false]);
  const [shaking, setShaking] = useState(false);

  // Backlog UI
  const [backlogOpen,    setBacklogOpen]    = useState(false);
  const [backlogDraft,   setBacklogDraft]   = useState('');
  const backlogInputRef = useRef(null);

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

  // ── Backlog handlers ───────────────────────────────────────────────────

  const addBacklogItem = () => {
    const text = backlogDraft.trim();
    if (!text) return;
    onBacklogChange([...backlogQuests, text]);
    setBacklogDraft('');
    backlogInputRef.current?.focus();
  };

  const removeBacklogItem = (index) => {
    const next = [...backlogQuests];
    next.splice(index, 1);
    onBacklogChange(next);
  };

  const handleBacklogKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBacklogItem();
    }
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
            {/* Quest number badge */}
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
                  {task.trim() ? '\u2713' : i + 1}
                </span>
              </div>
            </div>

            <input
              id={`quest-input-${i}`}
              type="text"
              value={task}
              onChange={e => updateTask(i, e.target.value)}
              onKeyDown={e => handleKeyDown(e, i)}
              placeholder={randomPlaceholder(i)}
              maxLength={80}
              className={`quest-input w-full rounded-lg pl-12 pr-4 py-3.5 text-sm font-rajdhani font-medium ${
                errors[i] ? 'border-red-500/60 animate-shake' : ''
              } ${shaking && errors[i] ? 'animate-shake' : ''}`}
            />

            {errors[i] && (
              <p className="text-red-400/80 text-[10px] font-rajdhani mt-1 pl-3">
                This quest cannot be empty
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Progress indicator */}
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
        <span className="mr-2">\u2694</span>
        ACCEPT QUESTS
        {filledCount > 0 && filledCount < QUEST_COUNT && (
          <span className="ml-2 font-rajdhani font-normal text-xs opacity-70">
            ({filledCount}/{QUEST_COUNT})
          </span>
        )}
      </button>

      {/* ── Future Quests Backlog ──────────────────────────────── */}
      <div className="mt-5">
        <button
          onClick={() => setBacklogOpen(o => !o)}
          className="w-full flex items-center justify-between py-2 px-1 group"
        >
          <span className="font-cinzel text-[10px] tracking-[0.25em] text-white/30 group-hover:text-white/50 transition-colors">
            FUTURE QUESTS
          </span>
          <span className="flex items-center gap-2">
            {backlogQuests.length > 0 && (
              <span
                className="font-rajdhani text-[10px] rounded-full px-1.5 py-0.5"
                style={{
                  background: 'rgba(240,192,64,0.1)',
                  border: '1px solid rgba(240,192,64,0.25)',
                  color: '#f0c040aa',
                }}
              >
                {backlogQuests.length}
              </span>
            )}
            <span className="text-white/25 text-xs group-hover:text-white/50 transition-colors">
              {backlogOpen ? '\u25be' : '\u25b8'}
            </span>
          </span>
        </button>

        {backlogOpen && (
          <div
            className="rounded-lg p-3 mt-1 animate-slide-up"
            style={{
              background: 'rgba(6,6,12,0.6)',
              border: '1px solid rgba(240,192,64,0.1)',
            }}
          >
            <p className="font-rajdhani text-white/25 text-[10px] tracking-wide mb-3">
              Queue quests here — they auto-fill your next session when you finish.
            </p>

            {/* Existing backlog items */}
            {backlogQuests.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {backlogQuests.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded px-2.5 py-2"
                    style={{ background: 'rgba(240,192,64,0.04)', border: '1px solid rgba(240,192,64,0.08)' }}
                  >
                    <span
                      className="font-cinzel text-[9px] text-gold/30 flex-shrink-0"
                      style={{ minWidth: '14px' }}
                    >
                      {i + 1}
                    </span>
                    <span className="font-rajdhani text-white/50 text-xs flex-1 leading-tight">
                      {q}
                    </span>
                    <button
                      onClick={() => removeBacklogItem(i)}
                      className="text-white/20 hover:text-red-400/70 transition-colors text-xs ml-1 flex-shrink-0"
                      aria-label="Remove"
                    >
                      \u2715
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new item */}
            <div className="flex gap-2">
              <input
                ref={backlogInputRef}
                type="text"
                value={backlogDraft}
                onChange={e => setBacklogDraft(e.target.value)}
                onKeyDown={handleBacklogKeyDown}
                placeholder="Add a future quest..."
                maxLength={80}
                className="quest-input flex-1 rounded-lg pl-3 pr-3 py-2 text-xs font-rajdhani"
              />
              <button
                onClick={addBacklogItem}
                disabled={!backlogDraft.trim()}
                className="font-cinzel text-[10px] tracking-wide rounded-lg px-3 py-2 transition-all flex-shrink-0 disabled:opacity-30"
                style={{
                  background: 'rgba(240,192,64,0.1)',
                  border: '1px solid rgba(240,192,64,0.25)',
                  color: '#f0c040',
                }}
              >
                + ADD
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
