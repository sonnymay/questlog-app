import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTodayString,
  getYesterdayString,
  processQuestCompletion,
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
  questsTowardLevel:      0,
  questsCompletedToday:   0,
  questsAbandonedToday:   0,
  activeTasks:            [],   // [{id, text, completed}]
  phase:                  'input',  // 'input' | 'questing' | 'celebration'
  todayDate:              '',

  // Cross-day persistent
  backlogQuests:     [],    // string[] — future queued quests
  questPrefill:      [],    // string[] — up to 3, pre-fills QuestInput after celebration
  streak:            0,     // consecutive days with >=1 completed session
  lastCompletedDate: '',    // ISO date string of last session completion
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
        // Preserve cross-day state
        backlogQuests:     saved.backlogQuests     ?? [],
        streak:            saved.streak            ?? 0,
        lastCompletedDate: saved.lastCompletedDate ?? '',
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

  // ── Computed values ───────────────────────────────────────────────────────

  // Display streak: only show if player completed a session today or yesterday
  // (a missed day breaks the streak visually without needing a state write)
  const today     = getTodayString();
  const yesterday = getYesterdayString();
  const streak =
    state.lastCompletedDate === today || state.lastCompletedDate === yesterday
      ? state.streak
      : 0;

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
    const tasks = taskTexts.map((text, i) => ({
      id: i,
      text: text.trim(),
      completed: false,
    }));
    setState(prev => ({
      ...prev,
      activeTasks:  tasks,
      phase:        'questing',
      questPrefill: [],   // consumed — clear it
    }));
  }, []);

  const toggleTask = useCallback((taskId) => {
    let pendingLevelUp = null;

    setState(prev => {
      if (prev.phase !== 'questing') return prev;

      const alreadyCompleted = prev.activeTasks.find(t => t.id === taskId)?.completed;
      if (alreadyCompleted) return prev;

      const updatedTasks = prev.activeTasks.map(t =>
        t.id === taskId ? { ...t, completed: true } : t
      );

      const allDone = updatedTasks.every(t => t.completed);

      if (!allDone) {
        return { ...prev, activeTasks: updatedTasks };
      }

      // All 3 tasks complete — advance quest progress + compute streak
      const { newQuestsTowardLevel, newLevel, levelsGained } = processQuestCompletion(
        prev.questsTowardLevel,
        prev.currentLevel,
      );

      const TIER_LEVELS = new Set([6, 11, 21, 31, 41, 51, 61, 71, 81, 91, 100]);
      if (levelsGained > 0 && TIER_LEVELS.has(newLevel)) {
        pendingLevelUp = { fromLevel: prev.currentLevel, toLevel: newLevel };
      }

      // Streak calculation
      const todayStr     = getTodayString();
      const yesterdayStr = getYesterdayString();
      const lastDate     = prev.lastCompletedDate ?? '';
      let newStreak      = prev.streak ?? 0;
      if (lastDate === todayStr) {
        // already counted today — keep streak unchanged
      } else if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      return {
        ...prev,
        activeTasks:          [],
        phase:                'celebration',
        questsTowardLevel:    newQuestsTowardLevel,
        currentLevel:         newLevel,
        questsCompletedToday: prev.questsCompletedToday + 1,
        todayDate:            todayStr,
        streak:               newStreak,
        lastCompletedDate:    todayStr,
      };
    });

    if (pendingLevelUp) {
      setTimeout(() => setLevelUpEvent(pendingLevelUp), 700);
    }
  }, []);

  // Called from the celebration screen's "Continue" button.
  // Auto-pulls from backlog: 3+ items -> skip input and go straight to questing;
  // fewer -> prefill input with what's available.
  const dismissCelebration = useCallback(() => {
    setState(prev => {
      const backlog   = prev.backlogQuests ?? [];
      const nextItems = backlog.slice(0, 3);
      const remaining = backlog.slice(3);

      if (nextItems.length === 3) {
        // Full queue — auto-start immediately
        const tasks = nextItems.map((text, i) => ({ id: i, text, completed: false }));
        return {
          ...prev,
          activeTasks:   tasks,
          backlogQuests: remaining,
          questPrefill:  [],
          phase:         'questing',
        };
      }

      // Partial or empty queue — prefill input with whatever we have
      return {
        ...prev,
        activeTasks:   [],
        backlogQuests: remaining,
        questPrefill:  nextItems,
        phase:         'input',
      };
    });
  }, []);

  const updateBacklogQuests = useCallback((quests) => {
    setState(prev => ({ ...prev, backlogQuests: quests }));
  }, []);

  const abandonQuest = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeTasks:          [],
      phase:                'input',
      questPrefill:         [],
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
    questsTowardLevel:    state.questsTowardLevel,
    questsCompletedToday: state.questsCompletedToday,
    questsAbandonedToday: state.questsAbandonedToday,
    activeTasks:          state.activeTasks,
    phase:                state.phase,
    backlogQuests:        state.backlogQuests ?? [],
    questPrefill:         state.questPrefill  ?? [],
    streak,

    // Ephemeral UI events
    levelUpEvent,
    xpGainEvent,

    // Actions
    setupCharacter,
    startQuesting,
    toggleTask,
    abandonQuest,
    dismissLevelUp,
    dismissCelebration,
    updateBacklogQuests,
    resetCharacter,
  };
}
