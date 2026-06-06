import { useCallback, useState } from 'react';
import { SCREEN, MODE } from './data/constants.js';
import Menu from './components/Menu.jsx';
import SetupScreen from './components/SetupScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import ResultScreen from './components/ResultScreen.jsx';

// State machine de telas: MENU → SETUP → GAME → RESULT → MENU (ramo ALBUM/BALLER
// nas próximas fases). O modo (2P/VS_CPU) acompanha a partida.
export default function App() {
  const [screen, setScreen] = useState(SCREEN.MENU);
  const [mode, setMode] = useState(MODE.TWO_PLAYER);
  const [result, setResult] = useState(null);

  const startMatch = useCallback((m) => {
    setMode(m);
    setScreen(SCREEN.SETUP);
  }, []);

  const onSetupReady = useCallback(() => setScreen(SCREEN.GAME), []);

  const onFinish = useCallback((res) => {
    setResult(res);
    setScreen(SCREEN.RESULT);
  }, []);

  const goMenu = useCallback(() => setScreen(SCREEN.MENU), []);

  switch (screen) {
    case SCREEN.SETUP:
      return <SetupScreen mode={mode} onReady={onSetupReady} />;
    case SCREEN.GAME:
      return <GameScreen mode={mode} onFinish={onFinish} />;
    case SCREEN.RESULT:
      return <ResultScreen result={result} onMenu={goMenu} />;
    case SCREEN.MENU:
    default:
      return <Menu onStart={startMatch} collectionCount={0} />;
  }
}
