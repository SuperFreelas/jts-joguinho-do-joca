import { useEffect, useState } from 'react';
import { gamepadStatus, onGamepadChange } from '../game/input.js';

// Status ao vivo dos controles. Faz polling leve (1x/s) além dos eventos,
// pois alguns navegadores não disparam gamepadconnected de forma confiável.
export default function GamepadStatus() {
  const [st, setSt] = useState(gamepadStatus());

  useEffect(() => {
    const off = onGamepadChange(setSt);
    const id = setInterval(() => setSt(gamepadStatus()), 1000);
    return () => {
      off();
      clearInterval(id);
    };
  }, []);

  return (
    <div className="gamepad-status">
      <div>
        🎮 Controle 1:{' '}
        {st.p1 ? <span className="ok">Conectado ✅</span> : <span className="wait">Aguardando...</span>}
      </div>
      <div>
        🎮 Controle 2:{' '}
        {st.p2 ? <span className="ok">Conectado ✅</span> : <span className="wait">Aguardando...</span>}
      </div>
    </div>
  );
}
