// Confetes de comemoração — CSS + Web Animations API, zero dependência.
// Usado ao acertar quiz e ao terminar livro/desenho. Celebração pontual
// e previsível, não mecânica de recompensa variável (spec 8.5).

const CORES = ['#e63946', '#f77f00', '#fcbf49', '#80b918', '#219ebc', '#9b5de5', '#f06fb8'];

export function soltarConfetes(origem?: { x: number; y: number }): void {
  const x = origem?.x ?? window.innerWidth / 2;
  const y = origem?.y ?? window.innerHeight / 3;

  for (let i = 0; i < 36; i++) {
    const peca = document.createElement('div');
    peca.className = 'confete';
    peca.style.left = `${x}px`;
    peca.style.top = `${y}px`;
    peca.style.background = CORES[i % CORES.length];
    document.body.appendChild(peca);

    const angulo = Math.random() * Math.PI * 2;
    const distancia = 120 + Math.random() * 260;
    const dx = Math.cos(angulo) * distancia;
    const dy = Math.sin(angulo) * distancia + 320; // gravidade
    const giro = Math.random() * 720 - 360;

    peca
      .animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${giro}deg)`, opacity: 0 },
        ],
        { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.15,.6,.4,1)' },
      )
      .addEventListener('finish', () => peca.remove());
  }
}
