import { MODE } from '../data/constants.js';

// Tela de resultado. No 1º Tempo: placar + vencedor + voltar ao menu.
// (Baller entra no 2º Tempo.)
export default function ResultScreen({ result, names, onMenu, onOpenBaller }) {
  const { winner, score, mode } = result;
  const nm = names || { right: 'Jogador 1', left: 'Jogador 2' };

  let title = 'GOOOL!';
  let sub;
  if (winner === 'draw') {
    title = 'EMPATE!';
    sub = '🤝 Ninguém ganhou baller';
  } else if (mode === MODE.VS_CPU && winner === 'left') {
    sub = '🤖 A máquina venceu!';
  } else {
    const who = winner === 'right' ? nm.right : nm.left;
    sub = `🏆 ${who} venceu!`;
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
