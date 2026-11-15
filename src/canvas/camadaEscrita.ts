// Escrever no desenho: números e palavras por cima da pintura — a resposta da
// tabuada dentro da caixinha, o nome do bicho, um balão de fala. Pedido do
// Bruno (2026-11-15): a criança pode querer responder a conta no próprio
// desenho, sem precisar imprimir.
//
// É mais uma camada, a de cima de todas, dentro da lente de zoom (amplia
// junto). Cada escrita guarda a posição em 0..1 da folha, como os traços do
// pincel: vale em qualquer tamanho de tela. Desenhada em SVG com a mesma
// caixa da arte, ela sai igual na impressão e na galeria (folhaPintada.ts).
//
// Com a ferramenta ✏️ ativa, tocar num lugar vazio abre um campo ali; tocar
// numa escrita a edita (apagar todo o texto a remove). Enter guarda, Esc
// desiste. Para ajustar o lugar: arrastar a escrita; ou "✥ Mover" e tocar no
// lugar novo; ou Alt + setas no teclado. Quem não acerta o toque escreve pela lista de partes ("Escrever
// nesta parte"), que abre o campo no meio da parte escolhida.

export interface Escrita {
  /** centro da escrita, em 0..1 da largura e da altura da folha */
  x: number;
  y: number;
  texto: string;
  cor: string;
  /** altura da letra, em fração da largura da folha */
  tamanho: number;
}

/** um tamanho que cabe na caixinha de resposta das folhas A4 (92×54 de 800) */
export const TAMANHO_DA_ESCRITA = 0.045;
const LIMITE = 40;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * As escritas como elementos <text> de um SVG com caixa `largura × altura`.
 * Usado na tela, na impressão e na galeria — a mesma conta nos três.
 */
export function escritasEmSvg(escritas: Escrita[], largura: number, altura: number): string {
  return escritas
    .filter((e) => e.texto.trim())
    .map((e) => {
      const cor = HEX.test(e.cor) ? e.cor : '#1a1a1a';
      const tamanho = Math.max(0.01, Math.min(0.2, e.tamanho || TAMANHO_DA_ESCRITA)) * largura;
      // contorno branco por baixo: a escrita se lê em cima de qualquer cor
      return (
        `<text x="${(e.x * largura).toFixed(1)}" y="${(e.y * altura).toFixed(1)}" ` +
        `font-family="Cardo, 'Atkinson Hyperlegible', serif" font-weight="700" font-size="${tamanho.toFixed(1)}" ` +
        `text-anchor="middle" dominant-baseline="central" fill="${cor}" ` +
        `stroke="#ffffff" stroke-width="${(tamanho * 0.12).toFixed(1)}" paint-order="stroke" ` +
        `pointer-events="none">${esc(e.texto.slice(0, LIMITE))}</text>`
      );
    })
    .join('');
}

/** Só aceita do armazenamento o que tem cara de escrita. */
export function escritasValidas(bruto: unknown): Escrita[] {
  if (!Array.isArray(bruto)) return [];
  return bruto.filter(
    (e): e is Escrita =>
      !!e &&
      typeof e === 'object' &&
      typeof e.texto === 'string' &&
      typeof e.x === 'number' &&
      typeof e.y === 'number' &&
      e.x >= 0 && e.x <= 1 && e.y >= 0 && e.y <= 1,
  );
}

export class CamadaEscrita {
  private readonly raiz: HTMLDivElement;
  private readonly svg: SVGSVGElement;
  private escritas: Escrita[] = [];
  private campo: HTMLInputElement | null = null;
  private fecharAtual: ((guardar: boolean) => void) | null = null;
  private aoMudarCb: ((antes: Escrita[]) => void) | null = null;
  // arrastar: qual escrita, de onde saiu, se já andou o bastante para valer
  private arrasto: {
    i: number;
    antes: Escrita[];
    px: number;
    py: number;
    ox: number;
    oy: number;
    andou: boolean;
  } | null = null;
  private engolirClique = false;
  // "✥ Mover": a próxima vez que tocar na folha, esta escrita vai para lá
  private movendo: number | null = null;

  constructor(
    lente: HTMLElement,
    private readonly largura: number,
    private readonly altura: number,
    private readonly corAtual: () => string,
    private readonly avisar: (texto: string) => void,
  ) {
    this.raiz = document.createElement('div');
    this.raiz.className = 'camada-escrita';
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('viewBox', `0 0 ${largura} ${altura}`);
    this.svg.setAttribute('aria-hidden', 'true');
    this.raiz.appendChild(this.svg);
    lente.appendChild(this.raiz);

    const naFolha = (alvo: EventTarget | null) =>
      alvo === this.raiz || alvo === this.svg || alvo instanceof SVGElement;

    // ARRASTAR (pedido do Bruno, 2026-11-15): pôr o nome certinho na linha
    // de "Nome", a data na de "Data". Pegar a escrita e levar. Um toque sem
    // arrastar continua abrindo a escrita para editar.
    this.raiz.addEventListener('pointerdown', (ev) => {
      if (!naFolha(ev.target) || !ev.isPrimary) return;
      const i = this.escritaEm(ev.clientX, ev.clientY);
      if (i < 0) return;
      const e = this.escritas[i];
      this.arrasto = { i, antes: this.obter(), px: ev.clientX, py: ev.clientY, ox: e.x, oy: e.y, andou: false };
      try {
        this.raiz.setPointerCapture(ev.pointerId);
      } catch {
        /* ponteiro sintético (testes) */
      }
      ev.preventDefault();
    });
    this.raiz.addEventListener('pointermove', (ev) => {
      const a = this.arrasto;
      if (!a) return;
      const dx = ev.clientX - a.px;
      const dy = ev.clientY - a.py;
      if (!a.andou && Math.hypot(dx, dy) < 6) return;
      a.andou = true;
      const r = this.raiz.getBoundingClientRect();
      const e = this.escritas[a.i];
      e.x = Math.min(1, Math.max(0, a.ox + dx / r.width));
      e.y = Math.min(1, Math.max(0, a.oy + dy / r.height));
      this.desenhar();
    });
    const soltar = () => {
      const a = this.arrasto;
      this.arrasto = null;
      if (!a?.andou) return;
      this.engolirClique = true; // o clique depois do arrasto não abre o campo
      this.avisar(`Moveu: ${this.escritas[a.i].texto}`);
      this.aoMudarCb?.(a.antes);
    };
    this.raiz.addEventListener('pointerup', soltar);
    this.raiz.addEventListener('pointercancel', soltar);

    this.raiz.addEventListener('click', (ev) => {
      if (this.engolirClique) {
        this.engolirClique = false;
        return;
      }
      if (!naFolha(ev.target)) return;
      const r = this.raiz.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width;
      const y = (ev.clientY - r.top) / r.height;
      if (this.movendo !== null) {
        const i = this.movendo;
        this.pararDeMover();
        this.moverPara(i, x, y);
        return;
      }
      const i = this.escritaEm(ev.clientX, ev.clientY);
      this.abrirCampo(x, y, i >= 0 ? i : null);
    });
  }

  /** Com a ferramenta ✏️ ativa, a camada recebe os toques; senão, deixa passar. */
  ativa(sim: boolean): void {
    this.raiz.classList.toggle('ativa', sim);
    if (!sim) {
      this.fecharCampo(true);
      this.pararDeMover();
    }
  }

  carregar(escritas: Escrita[]): void {
    this.escritas = escritas.map((e) => ({ ...e }));
    this.desenhar();
  }

  obter(): Escrita[] {
    return this.escritas.map((e) => ({ ...e }));
  }

  /** chamado a cada mudança, com a lista de ANTES (para o desfazer) */
  aoMudar(cb: (antes: Escrita[]) => void): void {
    this.aoMudarCb = cb;
  }

  desenhar(): void {
    this.svg.innerHTML = escritasEmSvg(this.escritas, this.largura, this.altura);
  }

  private pararDeMover(): void {
    this.movendo = null;
    this.raiz.classList.remove('movendo');
  }

  // qual escrita está debaixo do ponto da tela, pela caixa REAL do texto
  // desenhado, com uma folga para o dedo; -1 se nenhuma
  private escritaEm(clientX: number, clientY: number): number {
    const r = this.raiz.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * this.largura;
    const y = ((clientY - r.top) / r.height) * this.altura;
    const folga = 12;
    const textos = [...this.svg.querySelectorAll('text')];
    for (let i = textos.length - 1; i >= 0; i--) {
      const b = textos[i].getBBox();
      if (x >= b.x - folga && x <= b.x + b.width + folga && y >= b.y - folga && y <= b.y + b.height + folga) {
        return i;
      }
    }
    return -1;
  }

  private moverPara(i: number, x: number, y: number): void {
    const e = this.escritas[i];
    if (!e) return;
    const antes = this.obter();
    e.x = Math.min(1, Math.max(0, x));
    e.y = Math.min(1, Math.max(0, y));
    this.desenhar();
    this.avisar(`Moveu: ${e.texto}`);
    this.aoMudarCb?.(antes);
  }

  /** Abre o campo de escrever no ponto (x, y) — 0..1 da folha. */
  abrirCampo(x: number, y: number, indice: number | null = null): void {
    this.fecharCampo(true);
    const existente = indice !== null ? this.escritas[indice] : null;
    const cx = existente?.x ?? x;
    const cy = existente?.y ?? y;
    const campo = document.createElement('input');
    campo.className = 'campo-escrita';
    campo.type = 'text';
    campo.maxLength = LIMITE;
    campo.value = existente?.texto ?? '';
    campo.setAttribute(
      'aria-label',
      existente
        ? 'Mudar a escrita. Enter guarda, Esc desiste, Alt e as setas movem.'
        : 'Escrever no desenho. Enter guarda, Esc desiste.',
    );
    // números e palavras como a criança escreveu: sem corretor nem maiúscula
    campo.setAttribute('autocapitalize', 'off');
    campo.setAttribute('autocorrect', 'off');
    campo.spellcheck = false;
    // o campo tem a letra do tamanho que a escrita vai ter, e nunca sai da
    // folha: perto da borda ele encosta nela em vez de ficar cortado
    const r = this.raiz.getBoundingClientRect();
    const letra = Math.max(16, (existente?.tamanho ?? TAMANHO_DA_ESCRITA) * r.width);
    const larguraCampo = Math.min(r.width - 8, letra * 7);
    const meio = Math.min(r.width - larguraCampo / 2 - 4, Math.max(larguraCampo / 2 + 4, cx * r.width));
    campo.style.fontSize = `${letra.toFixed(1)}px`;
    campo.style.width = `${larguraCampo.toFixed(0)}px`;
    campo.style.left = `${((meio / r.width) * 100).toFixed(2)}%`;
    campo.style.top = `${(cy * 100).toFixed(2)}%`;
    campo.style.color = existente?.cor ?? this.corAtual();
    this.raiz.appendChild(campo);
    this.campo = campo;

    let feito = false;
    let mover: HTMLButtonElement | null = null;
    const concluir = (guardar: boolean) => {
      if (feito) return;
      feito = true;
      const texto = campo.value.trim();
      campo.remove();
      mover?.remove();
      if (this.campo === campo) this.campo = null;
      this.fecharAtual = null;
      if (!guardar) return;
      const antes = this.obter();
      if (existente && indice !== null) {
        if (!texto) {
          this.escritas.splice(indice, 1);
          this.avisar('Apagou a escrita.');
        } else if (texto !== this.escritas[indice].texto) {
          this.escritas[indice] = { ...this.escritas[indice], texto };
          this.avisar(`Escreveu: ${texto}`);
        } else return;
      } else {
        if (!texto) return;
        this.escritas.push({ x, y, texto, cor: this.corAtual(), tamanho: TAMANHO_DA_ESCRITA });
        this.avisar(`Escreveu: ${texto}`);
      }
      this.desenhar();
      this.aoMudarCb?.(antes);
    };
    this.fecharAtual = concluir;

    // "✥ Mover" junto de uma escrita que já existe: a alternativa ao
    // arrastar — tocar aqui e depois no lugar novo (dois toques, sem gesto)
    if (existente && indice !== null) {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'botao-mover-escrita';
      botao.textContent = '✥ Mover';
      botao.setAttribute('aria-label', 'Mover esta escrita: depois toque no lugar novo');
      botao.style.left = campo.style.left;
      botao.style.top = `calc(${campo.style.top} + ${(letra * 0.9 + 26).toFixed(0)}px)`;
      // sem isto o campo perderia o foco (e se fecharia) antes do clique
      botao.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      });
      botao.addEventListener('mousedown', (ev) => ev.preventDefault());
      botao.addEventListener('click', (ev) => {
        ev.stopPropagation();
        concluir(true);
        this.movendo = indice;
        this.raiz.classList.add('movendo');
        this.avisar('Toque no lugar para onde a escrita vai.');
      });
      this.raiz.appendChild(botao);
      mover = botao;
    }

    campo.addEventListener('keydown', (ev) => {
      ev.stopPropagation(); // + − 0 e setas são do texto aqui, não do zoom
      if (ev.key === 'Enter') concluir(true);
      else if (ev.key === 'Escape') concluir(false);
      else if (ev.altKey && existente && indice !== null && ev.key.startsWith('Arrow')) {
        // teclado: Alt + setas empurram a escrita aos pouquinhos
        ev.preventDefault();
        const passo = 0.005;
        const e = this.escritas[indice];
        const antes = this.obter();
        if (ev.key === 'ArrowLeft') e.x = Math.max(0, e.x - passo);
        if (ev.key === 'ArrowRight') e.x = Math.min(1, e.x + passo);
        if (ev.key === 'ArrowUp') e.y = Math.max(0, e.y - passo);
        if (ev.key === 'ArrowDown') e.y = Math.min(1, e.y + passo);
        this.desenhar();
        this.aoMudarCb?.(antes);
      }
    });
    campo.addEventListener('blur', () => concluir(true));
    campo.focus({ preventScroll: true });
  }

  private fecharCampo(guardar: boolean): void {
    this.fecharAtual?.(guardar);
    this.fecharAtual = null;
    this.campo = null;
  }
}
