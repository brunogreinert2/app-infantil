// Zoom por pinça na tela de colorir: dois dedos aproximam/afastam (1x–4x)
// e arrastam a vista; um dedo continua pintando normalmente.
// A "lente" (camadas base+pincel+linhas) recebe transform; a moldura fica
// fixa e recorta. Os listeners rodam em fase de CAPTURA para interceptar
// o gesto antes das camadas de pintura — e um clique fantasma logo após a
// pinça é engolido para não pintar região sem querer.

export interface ControleZoom {
  reiniciar(): void;
  escala(): number;
}

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

  const aplicar = () => {
    // nunca deixar a arte descolar da moldura
    const r = moldura.getBoundingClientRect();
    tx = Math.min(0, Math.max(tx, r.width * (1 - escala)));
    ty = Math.min(0, Math.max(ty, r.height * (1 - escala)));
    lente.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${escala.toFixed(3)})`;
  };

  moldura.addEventListener(
    'pointerdown',
    (ev) => {
      ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (ponteiros.size === 1) houvePinca = false;
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
      escala = Math.min(4, Math.max(1, (pinca.escala0 * dist) / pinca.dist0));
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

  // engole o clique fantasma disparado ao soltar a pinça
  moldura.addEventListener(
    'click',
    (ev) => {
      if (houvePinca) {
        ev.stopPropagation();
        ev.preventDefault();
        houvePinca = false;
      }
    },
    { capture: true },
  );

  return {
    reiniciar() {
      escala = 1;
      tx = 0;
      ty = 0;
      aplicar();
    },
    escala: () => escala,
  };
}
