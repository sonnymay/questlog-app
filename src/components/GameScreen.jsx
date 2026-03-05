import { useEffect, useRef, useState } from 'react';
import {
  getLevelName,
  CLASS_ICONS,
  CLASS_DISPLAY,
  QUEST_XP_REWARD,
} from '../utils/gameLogic';
import CharacterPortrait from './CharacterPortrait';
import XPBar from './XPBar';
import QuestInput from './QuestInput';
import QuestCard from './QuestCard';

export default function GameScreen({ gameState }) {
  const {
    characterName,
    gender,
    characterClass,
    currentLevel,
    currentXP,
    questsCompletedToday,
    questsAbandonedToday,
    activeTasks,
    phase,
    xpGainEvent,
    startQuesting,
    toggleTask,
    abandonQuest,
    resetCharacter,
  } = gameState;

  const levelName   = getLevelName(currentLevel);
  const classIcon   = CLASS_ICONS[characterClass] || '';
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

  // Confirm abandon
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  const handleAbandon = () => {
    if (!showAbandonConfirm) {
      setShowAbandonConfirm(true);
      setTimeout(() => setShowAbandonConfirm(false), 3000);
      return;
    }
    setShowAbandonConfirm(false);
    abandonQuest();
  };

  // Settings menu
  const [showSettings, setShowSettings] = useState(false);

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
            {/* Level badge */}
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

            {/* XP bar */}
            <div className="flex-1">
              <XPBar currentXP={currentXP} currentLevel={currentLevel} />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mt-2">
            <StatChip icon="✓" value={questsCompletedToday} label="Completed" color="green" />
            <StatChip icon="✗" value={questsAbandonedToday} label="Abandoned" color="red" />
            <StatChip icon="🏆" value={`${currentLevel}`} label="Level" color="gold" />
          </div>
        </div>
      </div>

      {/* ── Portrait + Quest area ───────────────────────────────── */}
      <div className="flex-1 relative z-10 px-4 pb-safe">

        {/* Character portrait */}
        <div className="mb-4">
          <CharacterPortrait
            gender={gender}
            characterClass={characterClass}
            level={currentLevel}
            levelName={levelName}
          />
        </div>

        {/* Quest section label */}
        <div className="divider-rune mb-4">
          <span className="font-cinzel text-[10px] tracking-[0.3em]">
            {phase === 'input' ? 'QUEST BOARD' : 'ACTIVE QUESTS'}
          </span>
        </div>

        {/* ── Input Phase ─────────────────────────── */}
        {phase === 'input' && (
          <QuestInput onStart={startQuesting} />
        )}

        {/* ── Questing Phase ──────────────────────── */}
        {phase === 'questing' && (
          <div className="animate-slide-up">
            {/* Progress header */}
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

            {/* Quest progress mini-bar */}
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

            {/* Quest cards */}
            <div className="space-y-3 mb-5">
              {activeTasks.map((task, i) => (
                <QuestCard
                  key={task.id}
                  task={task}
                  index={i}
                  onToggle={toggleTask}
                />
              ))}
            </div>

            {/* Abandon button */}
            <button
              onClick={handleAbandon}
              className={`btn-danger w-full rounded-lg py-3 text-xs tracking-[0.15em] ${
                showAbandonConfirm ? 'animate-pulse' : ''
              }`}
            >
              {showAbandonConfirm
                ? '⚠ TAP AGAIN TO ABANDON (NO XP)'
                : '✗ ABANDON QUEST'}
            </button>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>

      {/* ── XP Float Animations ─────────────────────────────────── */}
      {xpFloats.map(id => (
        <div
          key={id}
          className="xp-float-text"
          style={{
            top: '45%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '1.5rem',
          }}
        >
          +{QUEST_XP_REWARD} XP
        </div>
      ))}

      {/* Click to close settings overlay */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
        />
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
        <div
          className="font-cinzel text-sm font-bold leading-none"
          style={{ color: c.text }}
        >
          {value}
        </div>
        <div className="font-rajdhani text-[9px] text-white/30 tracking-wide uppercase mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}
