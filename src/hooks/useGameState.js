import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTodayString,
  processXPGain,
  QUEST_XP_REWARD,
} from '../utils/gameLogic';

const STORAGE_KEY = 'quest-log-v1';

const DEFAULT_PERSISTENT = {
  // Character — never reset
  isOnboarded:       false,
  characterName:     '',
  gender:            '',
  characterClass:    '',

  // Daily — reset each new day
  currentLevel:           1,
  currentXP:              0,
  questsCompletedToday:   0,
  questsAbandonedToday:   0,
  activeTasks:            [],   // [{id, text, completed}]
  phase:                  'input',  // 'input' | 'questing'
  todayDate:              '',
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PERSISTENT;

    const saved = JSON.parse(raw);
    const today = getTodayString();

    // Daily reset if the date has changed
    if (saved.todayDate !== today) {
      return {
        ...DEFAULT_PERSISTENT,
        // Preserve permanent character data
        isOnboarded:    saved.isOnboarded    ?? false,
        characterName:  saved.characterName  ?? '',
        gender:         saved.gender         ?? '',
        characterClass: saved.characterClass ?? '',
        todayDate: today,
      };
    }

    return { ...DEFAULT_PERSISTENT, ...saved };
  } catch {
    return DEFAULT_PERSISTENT;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded — silently ignore
  }
}

export function useGameState() {
  const [state, setState] = useState(loadState);

  // Ephemeral UI state — not persisted
  const [levelUpEvent, setLevelUpEvent] = useState(null);  // { fromLevel, toLevel }
  const [xpGainEvent,  setXpGainEvent]  = useState(null);  // timestamp key for re-triggering

  // Track previous questsCompletedToday to detect new completions
  const prevCompletedRef = useRef(state.questsCompletedToday);

  // Persist on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Detect quest completions to fire XP float animation
  useEffect(() => {
    if (state.questsCompletedToday > prevCompletedRef.current) {
      setXpGainEvent(Date.now());
      prevCompletedRef.current = state.questsCompletedToday;
    }
  }, [state.questsCompletedToday]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const setupCharacter = useCallback((characterName, gender, characterClass) => {
    setState(prev => ({
      ...prev,
      isOnboarded: true,
      characterName,
      gender,
      characterClass,
      todayDate: getTodayString(),
    }));
  }, []);

  const startQuesting = useCallback((taskTexts) => {
    // taskTexts is an array of 3 non-empty strings
    const tasks = taskTexts.map((text, i) => ({
      id: i,
      text: text.trim(),
      completed: false,
    }));
    setState(prev => ({
      ...prev,
      activeTasks: tasks,
      phase: 'questing',
    }));
  }, []);

  const toggleTask = useCallback((taskId) => {
    // Capture level-up event outside setState so we can set it
    let pendingLevelUp = null;

    setState(prev => {
      // Only allow toggling in questing phase
      if (prev.phase !== 'questing') return prev;

      const alreadyCompleted = prev.activeTasks.find(t => t.id === taskId)?.completed;
      // Prevent un-checking once checked
      if (alreadyCompleted) return prev;

      const updatedTasks = prev.activeTasks.map(t =>
        t.id === taskId ? { ...t, completed: true } : t
      );

      const allDone = updatedTasks.every(t => t.completed);

      if (!allDone) {
        return { ...prev, activeTasks: updatedTasks };
      }

      // All 3 tasks complete — award XP
      const { newXP, newLevel, levelsGained } = processXPGain(
        prev.currentXP,
        prev.currentLevel,
        QUEST_XP_REWARD
      );

      if (levelsGained > 0) {
        pendingLevelUp = { fromLevel: prev.currentLevel, toLevel: newLevel };
      }

      return {
        ...prev,
        activeTasks:          [],
        phase:                'input',
        currentXP:            newXP,
        currentLevel:         newLevel,
        questsCompletedToday: prev.questsCompletedToday + 1,
        todayDate:            getTodayString(),
      };
    });

    // Schedule level-up event slightly after state update paints
    if (pendingLevelUp) {
      // Use a timeout so the XP float renders first
      setTimeout(() => setLevelUpEvent(pendingLevelUp), 700);
    }
  }, []);

  const abandonQuest = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeTasks:          [],
      phase:                'input',
      questsAbandonedToday: prev.questsAbandonedToday + 1,
    }));
  }, []);

  const dismissLevelUp = useCallback(() => {
    setLevelUpEvent(null);
  }, []);

  const resetCharacter = useCallback(() => {
    setState(DEFAULT_PERSISTENT);
    setLevelUpEvent(null);
    setXpGainEvent(null);
  }, []);

  return {
    // Persistent state
    isOnboarded:          state.isOnboarded,
    characterName:        state.characterName,
    gender:               state.gender,
    characterClass:       state.characterClass,
    currentLevel:         state.currentLevel,
    currentXP:            state.currentXP,
    questsCompletedToday: state.questsCompletedToday,
    questsAbandonedToday: state.questsAbandonedToday,
    activeTasks:          state.activeTasks,
    phase:                state.phase,

    // Ephemeral UI events
    levelUpEvent,
    xpGainEvent,

    // Actions
    setupCharacter,
    startQuesting,
    toggleTask,
    abandonQuest,
    dismissLevelUp,
    resetCharacter,
  };
}
