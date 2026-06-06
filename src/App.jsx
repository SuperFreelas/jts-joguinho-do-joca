import { useCallback, useState } from 'react';
import { SCREEN, MODE } from './data/constants.js';
import { loadCollection, saveCollection } from './collection/storage.js';
import Menu from './components/Menu.jsx';
import SetupScreen from './components/SetupScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import ResultScreen from './components/ResultScreen.jsx';
import BallerScreen from './components/BallerScreen.jsx';
import AlbumScreen from './components/AlbumScreen.jsx';

// State machine de telas: MENU → SETUP → GAME → RESULT → BALLER → MENU
// (ramo ALBUM). O modo (2P/VS_CPU) acompanha a partida.
export default function App() {
  const [screen, setScreen] = useState(SCREEN.MENU);
  const [mode, setMode] = useState(MODE.TWO_PLAYER);
  const [result, setResult] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [names, setNames] = useState({ right: 'Jogador 1', left: 'Jogador 2' });
  const [collection, setCollection] = useState(() => loadCollection());

  const startMatch = useCallback((m) => {
    setMode(m);
    setScreen(SCREEN.SETUP);
  }, []);

  const onSetupReady = useCallback(({ placements: pl, names: nm }) => {
    setPlacements(pl || []);
    if (nm) setNames(nm);
    setScreen(SCREEN.GAME);
  }, []);

  const onFinish = useCallback((res) => {
    setResult(res);
    setScreen(SCREEN.RESULT);
  }, []);

  const goMenu = useCallback(() => setScreen(SCREEN.MENU), []);
  const openBaller = useCallback(() => setScreen(SCREEN.BALLER), []);
  const openAlbum = useCallback(() => setScreen(SCREEN.ALBUM), []);

  const onCollected = useCallback((newCollection) => {
    setCollection(newCollection);
    saveCollection(newCollection);
    setScreen(SCREEN.MENU);
  }, []);

  switch (screen) {
    case SCREEN.SETUP:
      return <SetupScreen mode={mode} collection={collection} onReady={onSetupReady} />;
    case SCREEN.GAME:
      return <GameScreen mode={mode} onFinish={onFinish} placements={placements} names={names} />;
    case SCREEN.RESULT:
      return <ResultScreen result={result} names={names} onMenu={goMenu} onOpenBaller={openBaller} />;
    case SCREEN.BALLER:
      return <BallerScreen collection={collection} onCollected={onCollected} />;
    case SCREEN.ALBUM:
      return <AlbumScreen collection={collection} onBack={goMenu} />;
    case SCREEN.MENU:
    default:
      return (
        <Menu
          onStart={startMatch}
          onOpenAlbum={openAlbum}
          collection={collection}
          collectionCount={collection.owned.length}
        />
      );
  }
}
