import { useState, useEffect, useRef } from 'react';
import { getPortraitUrl, CLASS_ICONS, CLASS_DISPLAY, getLevelName } from '../utils/gameLogic';
import { supabaseUrl } from '../utils/supabase';

export default function CharacterPortrait({ gender, characterClass, level, levelName }) {
  const [imgState, setImgState] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const [src, setSrc]           = useState('');
  const prevSrcRef              = useRef('');

  // Build URL whenever level, gender, or class changes.
  // Only reset imgState to 'loading' if the URL actually changed — otherwise
  // the browser won't re-fire onLoad (same src = no reload) and we'd be
  // stuck in a permanent blank-skeleton state.
  useEffect(() => {
    const url = getPortraitUrl(supabaseUrl, gender, characterClass, level);
    if (!url) {
      setImgState('error');
      return;
    }
    if (url !== prevSrcRef.current) {
      prevSrcRef.current = url;
      setImgState('loading');
    }
    setSrc(url);
  }, [gender, characterClass, level]);

  const classIcon = CLASS_ICONS[characterClass] || '?';
  const classDisplay = CLASS_DISPLAY[characterClass] || characterClass;

  return (
    <div className="relative w-full aspect-square max-w-[200px] mx-auto">
      {/* Decorative frame */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none z-10"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(240,192,64,0.25), inset 0 0 0 3px rgba(0,0,0,0.6)',
        }}
      />

      {/* Corner ornaments */}
      <CornerOrnament pos="top-left" />
      <CornerOrnament pos="top-right" />
      <CornerOrnament pos="bottom-left" />
      <CornerOrnament pos="bottom-right" />

      {/* Loading skeleton */}
      {imgState === 'loading' && (
        <div className="absolute inset-0 portrait-skeleton rounded-xl" />
      )}

      {/* Actual portrait */}
      {imgState !== 'error' && src && (
        <img
          src={src}
          alt={`${gender} ${classDisplay} level ${level}`}
          onLoad={() => setImgState('loaded')}
          onError={() => setImgState('error')}
          className={`absolute inset-0 w-full h-full object-cover rounded-xl transition-opacity duration-500 ${
            imgState === 'loaded' ? 'opacity-100 animate-portrait-in' : 'opacity-0'
          }`}
          style={{
            filter: 'contrast(1.05) saturate(1.1)',
          }}
        />
      )}

      {/* Fallback placeholder */}
      {imgState === 'error' && (
        <FallbackPortrait classIcon={classIcon} classDisplay={classDisplay} level={level} levelName={levelName} />
      )}

      {/* Level badge overlay */}
      <div className="absolute bottom-2 left-2 right-2 z-20 flex justify-between items-end pointer-events-none">
        <div className="level-badge rounded px-2 py-0.5">
          <span className="font-cinzel text-gold text-xs font-bold">Lv.{level}</span>
        </div>
        <div
          className="rounded px-1.5 py-0.5"
          style={{ background: 'rgba(6,6,12,0.8)', border: '1px solid rgba(240,192,64,0.2)' }}
        >
          <span className="font-rajdhani text-[10px] text-gold/70">{classIcon}</span>
        </div>
      </div>

      {/* Glow ring on loaded */}
      {imgState === 'loaded' && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none animate-glow-pulse"
          style={{ boxShadow: '0 0 0 1px rgba(124,58,237,0.3)' }}
        />
      )}
    </div>
  );
}

function CornerOrnament({ pos }) {
  const posClasses = {
    'top-left':     'top-0 left-0',
    'top-right':    'top-0 right-0 rotate-90',
    'bottom-left':  'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180',
  };
  return (
    <div
      className={`absolute w-4 h-4 z-20 pointer-events-none ${posClasses[pos]}`}
      style={{
        borderTop:  '2px solid rgba(240,192,64,0.5)',
        borderLeft: '2px solid rgba(240,192,64,0.5)',
        borderRadius: '3px 0 0 0',
      }}
    />
  );
}

function FallbackPortrait({ classIcon, classDisplay, level, levelName }) {
  return (
    <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone to-abyss">
      {/* Decorative grid */}
      <div className="absolute inset-0 bg-grid-pattern rounded-xl opacity-50" />

      <span className="text-5xl relative z-10">{classIcon}</span>
      <div className="text-center relative z-10">
        <div className="font-cinzel text-xs font-bold text-gold/80 tracking-widest uppercase">
          {classDisplay}
        </div>
        <div className="font-rajdhani text-[11px] text-white/40 mt-0.5">
          Level {level} · {levelName}
        </div>
      </div>

      {/* Placeholder notice */}
      <div
        className="absolute bottom-2 left-2 right-2 rounded text-center py-1 z-10"
        style={{ background: 'rgba(240,192,64,0.05)', border: '1px dashed rgba(240,192,64,0.2)' }}
      >
        <span className="font-rajdhani text-[9px] text-gold/30 tracking-wide">
          PORTRAIT LOADING
        </span>
      </div>
    </div>
  );
}
