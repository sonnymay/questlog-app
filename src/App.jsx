import { useGameState } from './hooks/useGameState';
import Onboarding from './components/Onboarding';
import GameScreen from './components/GameScreen';
import LevelUpOverlay from './components/LevelUpOverlay';

export default function App() {
  const gameState = useGameState();

  const {
    isOnboarded,
    gender,
    characterClass,
    levelUpEvent,
    setupCharacter,
    dismissLevelUp,
  } = gameState;

  return (
    <>
      {!isOnboarded ? (
        <Onboarding onSetup={setupCharacter} />
      ) : (
        <GameScreen gameState={gameState} />
      )}

      {levelUpEvent && isOnboarded && (
        <LevelUpOverlay
          event={levelUpEvent}
          gender={gender}
          characterClass={characterClass}
          onDismiss={dismissLevelUp}
        />
      )}
    </>
  );
}
