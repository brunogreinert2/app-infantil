// Zoom na tela de colorir: dois dedos aproximam/afastam (1x–4x) e arrastam
// a vista; um dedo continua pintando normalmente.
// Pinça pede dois dedos e coordenação; por isso TUDO o que ela faz também
// existe sem ela: `definir()` (botão da lupa, Ctrl+roda, teclas + e −) e
// `mover()` (botões de seta, teclas de seta).
// No computador, arrastar o mouse PINTA. Para andar pela arte ampliada sem as
// setas (pedido do Bruno, 2026-11-18): segurar a barra de espaço e arrastar,
// arrastar com o botão do meio, a roda do mouse (Shift + roda = para o lado),
// ou ligar o modo "mover" (botão ✋), que vale também para um dedo no tablet.
// A "lente" (camadas base+pincel+linhas) recebe transform; a moldura fica
// fixa e recorta. Os listeners rodam em fase de CAPTURA para interceptar
// o gesto antes das camadas de pintura — e um clique fantasma logo após a
// pinça é engolido para não pintar região sem querer.

export interface ControleZoom {
  reiniciar(): void;
  escala(): number;
  /** Define o zoom (1–4). Sem `centro`, amplia a partir do meio do que se vê. */
  definir(escala: number, centro?: { x: number; y: number }): void;
  /** Anda pela arte ampliada; 1 = uma tela inteira para a direita/baixo. */
  mover(dx: number, dy: number): void;
  aoMudar(cb: () => void): void;
  /** Liga/desliga o modo "mover": arrastar anda pela arte em vez de pintar. */
  modoMover(ativo?: boolean): boolean;
}

export const ZOOM_MAXIMO = 4;

export function instalarZoomPinca(
  moldura: HTMLElement,
  lente: HTMLElement,
  aoComecarPinca: () => void,
): ControleZoom {
  let escala = 1;
  let tx = 0;
  let ty = 0;
  const ponteiros = new Map<number, { x: number; y: number }>();
  let pinca: {
    dist0: number;
    escala0: number;
    px: number; // ponto ancorado, em coordenadas da lente sem transform
    py: number;
  } | null = null;
  let houvePinca = false;
  let avisar: (() => void) | null = null;
  // arrastar a vista (espaço, botão do meio ou modo mover)
  let moverLigado = false;
  let espaco = false;
  let arrasto: { id: number; x: number; y: number; tx0: number; ty0: number } | null = null;
  let houveArrasto = false;
  const cursor = () => {
    moldura.style.cursor = arrasto ? 'grabbing' : moverLigado || espaco ? 'grab' : '';
  };

  const aplicar = () => {
    // nunca deixar a arte descolar da moldura
    const r = moldura.getBoundingClientRect();
    tx = Math.min(0, Math.max(tx, r.width * (1 - escala)));
    ty = Math.min(0, Math.max(ty, r.height * (1 - escala)));
    lente.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${escala.toFixed(3)})`;
    avisar?.();
  };

  // Esquece qualquer gesto em andamento. No iPhone (Bruno, 2026-11-12), depois
  // de uma pinça até 4×, a lupa não trazia o zoom de volta — só outra pinça.
  // Não reproduzi no computador; a explicação que cabe é um dedo "fantasma":
  // o aviso de que o dedo saiu não chega, a pinça continua valendo por dentro
  // e desfaz o que o botão acabou de fazer. Então todo comando que não é
  // pinça (lupa, teclas, setas) começa limpando os dedos guardados.
  const esquecerGesto = () => {
    ponteiros.clear();
    pinca = null;
    houvePinca = false;
  };

  // muda a escala mantendo parado o ponto (x, y) da moldura
  const definir = (nova: number, centro?: { x: number; y: number }) => {
    const r = moldura.getBoundingClientRect();
    const c = centro ?? { x: r.width / 2, y: r.height / 2 };
    const alvo = Math.min(ZOOM_MAXIMO, Math.max(1, nova));
    const px = (c.x - tx) / escala;
    const py = (c.y - ty) / escala;
    escala = alvo;
    tx = c.x - px * escala;
    ty = c.y - py * escala;
    aplicar();
  };

  // Ctrl+roda (e a pinça do touchpad, que o navegador entrega como Ctrl+roda).
  // Roda sozinha: com o desenho em tamanho normal, é da página (rolar até a
  // paleta); com zoom, anda pela arte (Shift + roda = para o lado).
  moldura.addEventListener(
    'wheel',
    (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault();
        const r = moldura.getBoundingClientRect();
        definir(escala * (ev.deltaY < 0 ? 1.2 : 1 / 1.2), { x: ev.clientX - r.x, y: ev.clientY - r.y });
        return;
      }
      if (escala <= 1.01) return;
      ev.preventDefault();
      const dx = ev.shiftKey ? ev.deltaY : ev.deltaX;
      const dy = ev.shiftKey ? 0 : ev.deltaY;
      tx -= dx;
      ty -= dy;
      aplicar();
    },
    { passive: false },
  );

  // barra de espaço segurada = mão de arrastar (como nos programas de desenho)
  const emCampo = (alvo: EventTarget | null) =>
    alvo instanceof HTMLElement && (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(alvo.tagName) || alvo.isContentEditable);
  const aoTeclar = (ev: KeyboardEvent) => {
    if (!moldura.isConnected) {
      document.removeEventListener('keydown', aoTeclar, true);
      document.removeEventListener('keyup', aoTeclar, true);
      return;
    }
    if (ev.key !== ' ' || emCampo(ev.target)) return;
    const apertado = ev.type === 'keydown';
    if (apertado && escala <= 1.01) return;
    ev.preventDefault(); // não rolar a página
    if (espaco !== apertado) {
      espaco = apertado;
      cursor();
    }
  };
  document.addEventListener('keydown', aoTeclar, true);
  document.addEventListener('keyup', aoTeclar, true);
  // o botão do meio abre a "rolagem automática" do navegador: aqui não
  moldura.addEventListener('mousedown', (ev) => {
    if (ev.button === 1) ev.preventDefault();
  });

  moldura.addEventListener(
    'pointerdown',
    (ev) => {
      const querArrastar = (ev.pointerType === 'mouse' && (ev.button === 1 || espaco)) || (moverLigado && ev.isPrimary);
      if (!querArrastar || escala <= 1.01) return;
      arrasto = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, tx0: tx, ty0: ty };
      houveArrasto = false;
      try {
        moldura.setPointerCapture(ev.pointerId); // seguir o arrasto mesmo fora do desenho
      } catch {
        /* ponteiro que o navegador não reconhece: segue sem captura */
      }
      cursor();
      ev.stopPropagation();
      ev.preventDefault();
    },
    { capture: true },
  );
  moldura.addEventListener(
    'pointermove',
    (ev) => {
      if (!arrasto || ev.pointerId !== arrasto.id) return;
      ev.stopPropagation();
      ev.preventDefault();
      const dx = ev.clientX - arrasto.x;
      const dy = ev.clientY - arrasto.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) houveArrasto = true;
      tx = arrasto.tx0 + dx;
      ty = arrasto.ty0 + dy;
      aplicar();
    },
    { capture: true },
  );
  const fimDoArrasto = (ev: PointerEvent) => {
    if (!arrasto || ev.pointerId !== arrasto.id) return;
    arrasto = null;
    cursor();
    ev.stopPropagation();
  };
  moldura.addEventListener('pointerup', fimDoArrasto, { capture: true });
  moldura.addEventListener('pointercancel', fimDoArrasto, { capture: true });

  moldura.addEventListener(
    'pointerdown',
    (ev) => {
      // o primeiro dedo a tocar: não pode haver outro guardado de antes
      if (ev.isPrimary) ponteiros.clear();
      ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (ponteiros.size === 1) {
        houvePinca = false;
        pinca = null;
      }
      if (ponteiros.size === 2) {
        const [a, b] = [...ponteiros.values()];
        const r = moldura.getBoundingClientRect();
        const cx = (a.x + b.x) / 2 - r.x;
        const cy = (a.y + b.y) / 2 - r.y;
        pinca = {
          dist0: Math.hypot(a.x - b.x, a.y - b.y),
          escala0: escala,
          px: (cx - tx) / escala,
          py: (cy - ty) / escala,
        };
        houvePinca = true;
        arrasto = null; // o segundo dedo vira pinça: a mão para de arrastar
        cursor();
        aoComecarPinca(); // cancela traço de pincel iniciado pelo 1º dedo
        ev.stopPropagation();
      }
    },
    { capture: true },
  );

  moldura.addEventListener(
    'pointermove',
    (ev) => {
      if (!ponteiros.has(ev.pointerId)) return;
      ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (!pinca || ponteiros.size < 2) return;
      ev.stopPropagation();
      ev.preventDefault();
      const [a, b] = [...ponteiros.values()];
      const r = moldura.getBoundingClientRect();
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      escala = Math.min(ZOOM_MAXIMO, Math.max(1, (pinca.escala0 * dist) / pinca.dist0));
      const cx = (a.x + b.x) / 2 - r.x;
      const cy = (a.y + b.y) / 2 - r.y;
      // o ponto da arte sob o centro da pinça acompanha os dedos
      tx = cx - pinca.px * escala;
      ty = cy - pinca.py * escala;
      aplicar();
    },
    { capture: true },
  );

  const soltar = (ev: PointerEvent) => {
    ponteiros.delete(ev.pointerId);
    if (ponteiros.size < 2) pinca = null;
  };
  moldura.addEventListener('pointerup', soltar, { capture: true });
  moldura.addEventListener('pointercancel', soltar, { capture: true });
  // o dedo pode sair FORA do desenho: escutar também na janela
  const soltarFora = (ev: PointerEvent) => {
    if (!moldura.isConnected) {
      window.removeEventListener('pointerup', soltarFora, true);
      window.removeEventListener('pointercancel', soltarFora, true);
      return;
    }
    soltar(ev);
  };
  window.addEventListener('pointerup', soltarFora, true);
  window.addEventListener('pointercancel', soltarFora, true);

  // engole o clique fantasma disparado ao soltar a pinça
  moldura.addEventListener(
    'click',
    (ev) => {
      if (houvePinca || houveArrasto || moverLigado) {
        // o clique que sobra de uma pinça ou de um arrasto não pinta nada
        ev.stopPropagation();
        ev.preventDefault();
        houvePinca = false;
        houveArrasto = false;
      }
    },
    { capture: true },
  );

  return {
    reiniciar() {
      esquecerGesto();
      moverLigado = false;
      cursor();
      escala = 1;
      tx = 0;
      ty = 0;
      aplicar();
    },
    escala: () => escala,
    definir(nova, centro) {
      esquecerGesto();
      definir(nova, centro);
    },
    mover(dx, dy) {
      esquecerGesto();
      const r = moldura.getBoundingClientRect();
      tx -= dx * r.width;
      ty -= dy * r.height;
      aplicar();
    },
    aoMudar(cb) {
      avisar = cb;
    },
    modoMover(ativo) {
      if (ativo !== undefined) {
        moverLigado = ativo;
        cursor();
      }
      return moverLigado;
    },
  };
}
