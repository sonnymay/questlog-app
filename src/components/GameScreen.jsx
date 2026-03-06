import { useEffect, useRef, useState } from 'react';
import {
  getLevelName,
  CLASS_ICONS,
  CLASS_DISPLAY,
} from '../utils/gameLogic';
import CharacterPortrait from './CharacterPortrait';
import XPBar from './XPBar';
import QuestInput from './QuestInput';
import QuestCard from './QuestCard';
import SessionComplete from './SessionComplete';

export default function GameScreen({ gameState }) {
  const {
    characterName,
    gender,
    characterClass,
    currentLevel,
    questsTowardLevel,
    questsCompletedToday,
    questsAbandonedToday,
    activeTasks,
    phase,
    xpGainEvent,
    backlogQuests,
    questPrefill,
    streak,
    startQuesting,
    toggleTask,
    dismissCelebration,
    updateBacklogQuests,
    resetCharacter,
  } = gameState;

  const levelName    = getLevelName(currentLevel);
  const classIcon    = CLASS_ICONS[characterClass] || '';
  const classDisplay = CLASS_DISPLAY[characterClass] || characterClass;

  // XP float animation state
  const [xpFloats, setXpFloats] = useState([]);
  const xpGainRef = useRef(xpGainEvent);

  useEffect(() => {
    if (xpGainEvent && xpGainEvent !== xpGainRef.current) {
      xpGainRef.current = xpGainEvent;
      const id = Date.now();
      setXpFloats(prev => [...prev, id]);
      setTimeout(() => {
        setXpFloats(prev => prev.filter(f => f !== id));
      }, 2200);
    }
  }, [xpGainEvent]);

  // Settings menu
  const [showSettings, setShowSettings] = useState(false);

  // ── Persistent backlog drawer ─────────────────────────────────────────────
  const [backlogOpen,  setBacklogOpen]  = useState(false);
  const [backlogDraft, setBacklogDraft] = useState('');
  const backlogInputRef = useRef(null);

  const addBacklogItem = () => {
    const text = backlogDraft.trim();
    if (!text) return;
    updateBacklogQuests([...backlogQuests, text]);
    setBacklogDraft('');
    setTimeout(() => backlogInputRef.current?.focus(), 0);
  };

  const removeBacklogItem = (i) => {
    const next = [...backlogQuests];
    next.splice(i, 1);
    updateBacklogQuests(next);
  };

  const handleBacklogKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addBacklogItem(); }
  };

  const completedTasks = activeTasks.filter(t => t.completed).length;
  const allComplete    = activeTasks.length > 0 && completedTasks === activeTasks.length;

  return (
    <div className="app-container bg-void bg-texture min-h-screen flex flex-col relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none opacity-60" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="relative z-10 px-4 pt-safe">
        <div className="pt-3 pb-3">

          {/* Top row: name + settings */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-gold text-xs font-bold tracking-widest uppercase">
                {characterName}
              </span>
              <span className="text-white/20 text-xs">|</span>
              <span className="font-rajdhani text-white/40 text-xs tracking-wide">
                {classIcon} {classDisplay}
              </span>
            </div>
            <button
              onClick={() => setShowSettings(s => !s)}
              className="text-white/30 hover:text-white/60 transition-colors text-lg p-1"
              aria-label="Settings"
            >
              ⚙
            </button>
          </div>

          {/* Settings dropdown */}
          {showSettings && (
            <div
              className="absolute right-4 top-14 z-50 rounded-lg p-3 w-48 animate-slide-up"
              style={{
                background: '#13131f',
                border: '1px solid rgba(240,192,64,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
              }}
            >
              <button
                onClick={() => {
                  setShowSettings(false);
                  if (window.confirm('Reset character? This cannot be undone.')) {
                    resetCharacter();
                  }
                }}
                className="w-full text-left font-rajdhani text-red-400/70 text-sm py-2 px-2 rounded hover:bg-red-500/10 transition-colors"
              >
                🗑 Reset Character
              </button>
            </div>
          )}

          {/* Level + XP row */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="level-badge rounded-lg px-3 py-1.5 flex-shrink-0 text-center"
              style={{ minWidth: '52px' }}
            >
              <div className="font-cinzel text-gold text-lg font-black leading-none">
                {currentLevel}
              </div>
              <div className="font-rajdhani text-gold/40 text-[9px] tracking-[0.1em] uppercase mt-0.5">
                {levelName}
              </div>
            </div>
            <div className="flex-1">
              <XPBar questsTowardLevel={questsTowardLevel} currentLevel={currentLevel} />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-2 mt-2">
            <StatChip icon="✓" value={questsCompletedToday} label="Completed" color="green" />
            <StatChip icon="✗" value={questsAbandonedToday} label="Abandoned" color="red" />
            <StatChip icon="🔥" value={streak}              label="Streak"    color="gold" />
          </div>
        </div>
      </div>

      {/* ── Portrait + Quest area ───────────────────────────────── */}
      <div className="flex-1 relative z-10 px-4 pb-safe">

        <div className="mb-4">
          <CharacterPortrait
            gender={gender}
            characterClass={characterClass}
            level={currentLevel}
            levelName={levelName}
          />
        </div>

        <div className="divider-rune mb-4">
          <span className="font-cinzel text-[10px] tracking-[0.3em]">
            {phase === 'input' ? 'QUEST BOARD' : 'ACTIVE QUESTS'}
          </span>
        </div>

        {/* ── Input Phase ─────────────────────────── */}
        {phase === 'input' && (
          <QuestInput
            onStart={startQuesting}
            prefill={questPrefill}
          />
        )}

        {/* ── Questing Phase ──────────────────────── */}
        {phase === 'questing' && (
          <div className="animate-slide-up">
            <div className="flex justify-between items-center mb-3">
              <span className="font-rajdhani text-white/40 text-xs tracking-wide">
                {completedTasks}/{activeTasks.length} QUESTS SLAIN
              </span>
              {allComplete && (
                <span className="font-cinzel text-green-400 text-xs font-bold animate-pulse-gold">
                  ✦ ALL COMPLETE ✦
                </span>
              )}
            </div>

            <div className="h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(completedTasks / activeTasks.length) * 100}%`,
                  background: allComplete
                    ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                    : 'linear-gradient(90deg, #f0c040, #c9a227)',
                  boxShadow: allComplete
                    ? '0 0 8px rgba(34,197,94,0.6)'
                    : '0 0 8px rgba(240,192,64,0.4)',
                }}
              />
            </div>

            <div className="space-y-3">
              {activeTasks.map((task, i) => (
                <QuestCard
                  key={task.id}
                  task={task}
                  index={i}
                  onToggle={toggleTask}
                />
              ))}
            </div>
          </div>
        )}

        <div className="h-20" />
      </div>

      {/* ── XP Float Animations ─────────────────────────────────── */}
      {xpFloats.map(id => (
        <div
          key={id}
          className="xp-float-text"
          style={{ top: '45%', left: '50%', transform: 'translateX(-50%)', fontSize: '1.5rem' }}
        >
          QUEST COMPLETE!
        </div>
      ))}

      {/* ── Session Complete (level-up only) ────────────────────── */}
      {phase === 'celebration' && (
        <SessionComplete
          currentLevel={currentLevel}
          questsCompletedToday={questsCompletedToday}
          hasBacklog={backlogQuests.length >= 3}
          onContinue={dismissCelebration}
        />
      )}

      {/* ── Settings backdrop ───────────────────────────────────── */}
      {showSettings && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
      )}

      {/* ── Persistent Backlog Floating Button ──────────────────── */}
      {/* Always visible — lets the user queue future quests at any time */}
      <button
        onClick={() => setBacklogOpen(o => !o)}
        className="fixed z-30 flex items-center gap-1.5 font-cinzel text-[10px] tracking-widest rounded-full transition-all"
        style={{
          bottom:     '20px',
          right:      '16px',
          padding:    '8px 14px',
          background: backlogOpen ? 'rgba(240,192,64,0.18)' : '#13131f',
          border:     '1px solid rgba(240,192,64,0.35)',
          color:      '#f0c040',
          boxShadow:  '0 4px 20px rgba(0,0,0,0.7)',
        }}
        aria-label="Future Quests Queue"
      >
        <span>📜</span>
        <span>QUEUE</span>
        {backlogQuests.length > 0 && (
          <span
            className="font-rajdhani font-bold text-[11px] rounded-full px-1.5 leading-none py-0.5"
            style={{ background: 'rgba(240,192,64,0.25)', color: '#f0c040' }}
          >
            {backlogQuests.length}
          </span>
        )}
      </button>

      {/* ── Backlog Drawer backdrop ──────────────────────────────── */}
      {backlogOpen && (
        <div
          className="fixed inset-0 z-30"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setBacklogOpen(false)}
        />
      )}

      {/* ── Backlog Drawer panel ─────────────────────────────────── */}
      {backlogOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 z-40 animate-slide-up"
          style={{
            background:  '#0d0d1a',
            borderTop:   '1px solid rgba(240,192,64,0.2)',
            boxShadow:   '0 -8px 40px rgba(0,0,0,0.8)',
            maxHeight:   '65vh',
            display:     'flex',
            flexDirection: 'column',
          }}
        >
          {/* Drawer header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(240,192,64,0.1)' }}
          >
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-gold text-xs tracking-widest">FUTURE QUESTS</span>
              {backlogQuests.length > 0 && (
                <span
                  className="font-rajdhani text-[10px] rounded-full px-1.5 py-0.5"
                  style={{ background: 'rgba(240,192,64,0.15)', color: '#f0c040aa' }}
                >
                  {backlogQuests.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setBacklogOpen(false)}
              className="text-white/30 hover:text-white/60 transition-colors text-lg leading-none p-1"
            >
              ×
            </button>
          </div>

          {/* Description */}
          <p className="font-rajdhani text-white/25 text-[10px] tracking-wide px-4 pt-3 pb-1 flex-shrink-0">
            Queue quests here — when a session ends, the next 3 auto-fill your quest board.
          </p>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
            {backlogQuests.length === 0 && (
              <p className="font-rajdhani text-white/20 text-xs text-center py-4 italic">
                No quests queued yet.
              </p>
            )}
            {backlogQuests.map((q, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                style={{
                  background: 'rgba(240,192,64,0.04)',
                  border: '1px solid rgba(240,192,64,0.1)',
                }}
              >
                <span className="font-cinzel text-[9px] text-gold/30 flex-shrink-0 w-4 text-right">
                  {i + 1}
                </span>
                <span className="font-rajdhani text-white/55 text-xs flex-1 leading-tight">
                  {q}
                </span>
                <button
                  onClick={() => removeBacklogItem(i)}
                  className="text-white/20 hover:text-red-400/60 transition-colors text-sm flex-shrink-0 ml-1"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Add input */}
          <div
            className="flex gap-2 px-4 py-3 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(240,192,64,0.08)' }}
          >
            <input
              ref={backlogInputRef}
              type="text"
              value={backlogDraft}
              onChange={e => setBacklogDraft(e.target.value)}
              onKeyDown={handleBacklogKey}
              placeholder="Add a future quest..."
              maxLength={80}
              className="quest-input flex-1 rounded-lg px-3 py-2.5 text-sm font-rajdhani"
            />
            <button
              onClick={addBacklogItem}
              disabled={!backlogDraft.trim()}
              className="font-cinzel text-[10px] tracking-wide rounded-lg px-4 py-2.5 transition-all flex-shrink-0 disabled:opacity-30"
              style={{
                background: 'rgba(240,192,64,0.1)',
                border:     '1px solid rgba(240,192,64,0.3)',
                color:      '#f0c040',
              }}
            >
              + ADD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatChip({ icon, value, label, color }) {
  const colors = {
    green: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',  text: '#4ade80' },
    red:   { bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)',  text: '#f87171' },
    gold:  { bg: 'rgba(240,192,64,0.08)', border: 'rgba(240,192,64,0.2)', text: '#f0c040' },
  };
  const c = colors[color] || colors.gold;

  return (
    <div
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 flex-1"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <span className="text-sm leading-none">{icon}</span>
      <div>
        <div className="font-cinzel text-sm font-bold leading-none" style={{ color: c.text }}>
          {value}
        </div>
        <div className="font-rajdhani text-[9px] text-white/30 tracking-wide uppercase mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}
