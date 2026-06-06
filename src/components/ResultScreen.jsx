import { MODE } from '../data/constants.js';

// Tela de resultado. No 1º Tempo: placar + vencedor + voltar ao menu.
// (Baller entra no 2º Tempo.)
export default function ResultScreen({ result, onMenu, onOpenBaller }) {
  const { winner, score, mode } = result;

  let title = 'GOOOL!';
  let sub;
  if (winner === 'draw') {
    title = 'EMPATE!';
    sub = '🤝 Ninguém ganhou baller';
  } else if (mode === MODE.VS_CPU) {
    // No VS Máquina o humano é o P1 (direita).
    sub = winner === 'right' ? '🏆 Você venceu!' : '🤖 A máquina venceu!';
  } else {
    sub = winner === 'right' ? '🟡 Jogador 1 venceu!' : '🔵 Jogador 2 venceu!';
  }

  return (
    <div className="screen">
      <h1 className="result-title">{title}</h1>
      <div className="result-score">
        <span style={{ color: 'var(--p2)' }}>{score.left}</span>
        {' × '}
        <span style={{ color: 'var(--p1)' }}>{score.right}</span>
      </div>
      <div className="result-sub">{sub}</div>
      {winner === 'draw' ? (
        <button className="btn btn--green" onClick={onMenu}>
          🔄 Jogar de novo!
        </button>
      ) : (
        <>
          <button className="btn btn--shake" onClick={onOpenBaller}>
            ⚽ ABRIR BALLER!
          </button>
          <button className="btn btn--gold" onClick={onMenu}>
            🏠 Menu
          </button>
        </>
      )}
    </div>
  );
}
