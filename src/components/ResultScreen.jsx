import { MODE } from '../data/constants.js';

// Tela de resultado. No 1º Tempo: placar + vencedor + voltar ao menu.
// (Baller entra no 2º Tempo.)
export default function ResultScreen({ result, onMenu }) {
  const { winner, score, mode } = result;

  let title = 'GOOOL!';
  let sub;
  if (winner === 'draw') {
    title = 'EMPATE!';
    sub = '🤝 Ninguém ganhou baller';
  } else if (mode === MODE.VS_CPU) {
    sub = winner === 'bottom' ? '🏆 Você venceu!' : '🤖 A máquina venceu!';
  } else {
    sub = winner === 'bottom' ? '🟡 Jogador 1 venceu!' : '🔵 Jogador 2 venceu!';
  }

  return (
    <div className="screen">
      <h1 className="result-title">{title}</h1>
      <div className="result-score">
        <span style={{ color: 'var(--p2)' }}>{score.top}</span>
        {' × '}
        <span style={{ color: 'var(--p1)' }}>{score.bottom}</span>
      </div>
      <div className="result-sub">{sub}</div>
      <button className="btn btn--green" onClick={onMenu}>
        🔄 Jogar de novo!
      </button>
    </div>
  );
}
