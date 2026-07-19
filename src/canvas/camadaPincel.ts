// Camada de pincel livre: <canvas> transparente sobre a camada base.
// Traços são guardados em coordenadas NORMALIZADAS (0..1) — redesenhar
// em qualquer tamanho de tela/DPR fica trivial, e a persistência não
// depende da resolução do aparelho.

export interface Traco {
  cor: string;
  largura: number; // fração da largura do canvas (ex: 0.015)
  borracha: boolean;
  pontos: [number, number][]; // normalizados 0..1
}

export class CamadaPincel {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tracos: Traco[] = [];
  private atual: Traco | null = null;
  private cb: (() => void) | null = null;
  private obterEstilo: () => { cor: string; borracha: boolean };

  constructor(container: HTMLElement, obterEstilo: () => { cor: string; borracha: boolean }) {
    this.obterEstilo = obterEstilo;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'camada-pincel';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    new ResizeObserver(() => this.redimensionar()).observe(container);
    this.redimensionar();

    this.canvas.addEventListener('pointerdown', (ev) => {
      this.canvas.setPointerCapture(ev.pointerId);
      const { cor, borracha } = this.obterEstilo();
      this.atual = {
        cor,
        borracha,
        largura: borracha ? 0.045 : 0.018,
        pontos: [this.normalizar(ev)],
      };
    });
    this.canvas.addEventListener('pointermove', (ev) => {
      if (!this.atual) return;
      this.atual.pontos.push(this.normalizar(ev));
      this.redesenhar();
      this.desenharTraco(this.atual);
    });
    const soltar = () => {
      if (!this.atual) return;
      if (this.atual.pontos.length > 1) {
        this.tracos.push(this.atual);
        this.cb?.();
      }
      this.atual = null;
      this.redesenhar();
    };
    this.canvas.addEventListener('pointerup', soltar);
    this.canvas.addEventListener('pointercancel', soltar);
  }

  private normalizar(ev: PointerEvent): [number, number] {
    const r = this.canvas.getBoundingClientRect();
    return [(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height];
  }

  private redimensionar(): void {
    const r = this.canvas.getBoundingClientRect();
    if (r.width === 0) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.redesenhar();
  }

  ativa(sim: boolean): void {
    // roteamento de eventos da spec 8.2: pincel captura o toque quando
    // ativo; com balde ativo, o toque passa direto para a camada base
    this.canvas.style.pointerEvents = sim ? 'auto' : 'none';
  }

  private desenharTraco(t: Traco): void {
    const { width: w, height: h } = this.canvas;
    if (t.pontos.length < 2) return;
    this.ctx.save();
    this.ctx.globalCompositeOperation = t.borracha ? 'destination-out' : 'source-over';
    this.ctx.strokeStyle = t.cor;
    this.ctx.lineWidth = t.largura * w;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(t.pontos[0][0] * w, t.pontos[0][1] * h);
    for (const [x, y] of t.pontos.slice(1)) this.ctx.lineTo(x * w, y * h);
    this.ctx.stroke();
    this.ctx.restore();
  }

  redesenhar(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const t of this.tracos) this.desenharTraco(t);
  }

  aoMudar(cb: () => void): void {
    this.cb = cb;
  }

  carregar(tracos: Traco[]): void {
    this.tracos = tracos;
    this.redesenhar();
  }

  obterTracos(): Traco[] {
    return this.tracos;
  }

  desfazerUltimo(): boolean {
    if (this.tracos.length === 0) return false;
    this.tracos.pop();
    this.redesenhar();
    this.cb?.();
    return true;
  }
}
