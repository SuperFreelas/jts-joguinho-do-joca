import { useEffect } from 'react';

// STUB do 1º Tempo: transita direto para o jogo. Na Prorrogação vira a tela de
// posicionamento de lendários. Mantido na rota para que as fases sejam aditivas.
export default function SetupScreen({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}
