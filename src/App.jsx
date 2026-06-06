import { useCallback, useState } from 'react';
import { SCREEN, MODE } from './data/constants.js';
import { loadProfiles, saveProfiles, getProfile, withProfile } from './collection/storage.js';
import Menu from './components/Menu.jsx';
import SetupScreen from './components/SetupScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import ResultScreen from './components/ResultScreen.jsx';
import BallerScreen from './components/BallerScreen.jsx';
import AlbumScreen from './components/AlbumScreen.jsx';
import AlbumsListScreen from './components/AlbumsListScreen.jsx';

// State machine: MENU → SETUP → GAME → RESULT → BALLER → MENU (ramo ALBUMS/ALBUM).
// Coleções são POR JOGADOR (perfis por nome).
export default function App() {
  const [screen, setScreen] = useState(SCREEN.MENU);
  const [mode, setMode] = useState(MODE.TWO_PLAYER);
  const [result, setResult] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [names, setNames] = useState({ right: 'Jogador 1', left: 'Jogador 2' });
  const [profiles, setProfiles] = useState(() => loadProfiles());
  const [albumName, setAlbumName] = useState(null);

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
  const openAlbums = useCallback(() => setScreen(SCREEN.ALBUMS), []);
  const openAlbum = useCallback((name) => {
    setAlbumName(name);
    setScreen(SCREEN.ALBUM);
  }, []);

  // nome do vencedor (quem ganha o baller)
  const winnerName = result
    ? result.winner === 'right'
      ? names.right
      : names.left
    : null;

  const onCollected = useCallback(
    (newProfile) => {
      const next = withProfile(profiles, winnerName, newProfile);
      setProfiles(next);
      saveProfiles(next);
      setScreen(SCREEN.MENU);
    },
    [profiles, winnerName],
  );

  switch (screen) {
    case SCREEN.SETUP:
      return <SetupScreen mode={mode} profiles={profiles} onReady={onSetupReady} />;
    case SCREEN.GAME:
      return <GameScreen mode={mode} onFinish={onFinish} placements={placements} names={names} />;
    case SCREEN.RESULT:
      return <ResultScreen result={result} names={names} onMenu={goMenu} onOpenBaller={openBaller} />;
    case SCREEN.BALLER:
      return (
        <BallerScreen
          collection={getProfile(profiles, winnerName)}
          winnerName={winnerName}
          onCollected={onCollected}
        />
      );
    case SCREEN.ALBUMS:
      return <AlbumsListScreen profiles={profiles} onOpen={openAlbum} onBack={goMenu} />;
    case SCREEN.ALBUM:
      return (
        <AlbumScreen
          collection={getProfile(profiles, albumName)}
          playerName={albumName}
          onBack={openAlbums}
        />
      );
    case SCREEN.MENU:
    default:
      return <Menu onStart={startMatch} onOpenAlbums={openAlbums} />;
  }
}
