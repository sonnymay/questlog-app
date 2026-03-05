import { useState } from 'react';

export default function QuestCard({ task, index, onToggle }) {
  const [justCompleted, setJustCompleted] = useState(false);

  const handleToggle = () => {
    if (task.completed) return;
    setJustCompleted(true);
    // Small delay so the animation plays before parent re-renders
    setTimeout(() => onToggle(task.id), 200);
  };

  const isCompleted = task.completed || justCompleted;

  return (
    <div
      className={`quest-card rounded-xl p-4 flex items-start gap-3 transition-all duration-500 ${
        isCompleted ? 'completed' : ''
      }`}
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Quest number */}
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-300 ${
            isCompleted
              ? 'bg-green-500/20 border border-green-500/40'
              : 'bg-gold/10 border border-gold/30'
          }`}
        >
          <span
            className={`font-cinzel text-[10px] font-bold ${
              isCompleted ? 'text-green-400' : 'text-gold/60'
            }`}
          >
            {isCompleted ? '✓' : index + 1}
          </span>
        </div>
      </div>

      {/* Task text */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-rajdhani text-sm font-medium leading-snug transition-all duration-300 ${
            isCompleted
              ? 'text-green-400/60 line-through decoration-green-500/40'
              : 'text-white/85'
          }`}
        >
          {task.text}
        </p>
        {isCompleted && (
          <p className="font-rajdhani text-[10px] text-green-500/50 mt-1 tracking-wide">
            QUEST COMPLETE
          </p>
        )}
      </div>

      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={isCompleted}
        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
          isCompleted
            ? 'bg-green-500/20 border border-green-500/50 cursor-default'
            : 'bg-void border border-gold/30 hover:border-gold/60 hover:bg-gold/5 active:scale-95 cursor-pointer'
        }`}
      >
        {isCompleted ? (
          <span className="text-green-400 text-base leading-none animate-checkmark">✓</span>
        ) : (
          <span className="text-gold/20 text-xs">○</span>
        )}
      </button>

      {/* Parchment texture overlay */}
      {!isCompleted && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
          }}
        />
      )}
    </div>
  );
}
