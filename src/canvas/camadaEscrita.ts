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
// desiste. Quem não acerta o toque escreve pela lista de partes ("Escrever
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
  private aoMudarCb: ((antes: Escrita[]) => void) | null = null;

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
    this.raiz.addEventListener('click', (ev) => {
      if (ev.target === this.campo) return;
      const r = this.raiz.getBoundingClientRect();
      this.tocar((ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height);
    });
  }

  /** Com a ferramenta ✏️ ativa, a camada recebe os toques; senão, deixa passar. */
  ativa(sim: boolean): void {
    this.raiz.classList.toggle('ativa', sim);
    if (!sim) this.fecharCampo(true);
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

  // toque perto de uma escrita: edita ela; senão, abre uma nova ali
  private tocar(x: number, y: number): void {
    const perto = this.escritas.findIndex(
      (e) => Math.abs(e.x - x) < 0.06 + (e.texto.length * e.tamanho) / 3 && Math.abs((e.y - y) * (this.altura / this.largura)) < e.tamanho,
    );
    this.abrirCampo(x, y, perto >= 0 ? perto : null);
  }

  /** Abre o campo de escrever no ponto (x, y) — 0..1 da folha. */
  abrirCampo(x: number, y: number, indice: number | null = null): void {
    this.fecharCampo(true);
    const existente = indice !== null ? this.escritas[indice] : null;
    const campo = document.createElement('input');
    campo.className = 'campo-escrita';
    campo.type = 'text';
    campo.maxLength = LIMITE;
    campo.value = existente?.texto ?? '';
    campo.setAttribute('aria-label', 'Escrever no desenho. Enter guarda, Esc desiste.');
    // números e palavras como a criança escreveu: sem corretor nem maiúscula
    campo.setAttribute('autocapitalize', 'off');
    campo.setAttribute('autocorrect', 'off');
    campo.spellcheck = false;
    campo.style.left = `${(existente?.x ?? x) * 100}%`;
    campo.style.top = `${(existente?.y ?? y) * 100}%`;
    campo.style.color = existente?.cor ?? this.corAtual();
    this.raiz.appendChild(campo);
    this.campo = campo;
    let feito = false;
    const concluir = (guardar: boolean) => {
      if (feito) return;
      feito = true;
      const texto = campo.value.trim();
      campo.remove();
      if (this.campo === campo) this.campo = null;
      if (!guardar) return;
      const antes = this.obter();
      if (existente && indice !== null) {
        if (!texto) {
          this.escritas.splice(indice, 1);
          this.avisar('Apagou a escrita.');
        } else if (texto !== existente.texto) {
          this.escritas[indice] = { ...existente, texto };
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
    campo.addEventListener('keydown', (ev) => {
      ev.stopPropagation(); // + − 0 e setas são do texto aqui, não do zoom
      if (ev.key === 'Enter') concluir(true);
      else if (ev.key === 'Escape') concluir(false);
    });
    campo.addEventListener('blur', () => concluir(true));
    campo.focus({ preventScroll: true });
  }

  private fecharCampo(guardar: boolean): void {
    if (!this.campo) return;
    if (guardar) this.campo.blur();
    else this.campo.remove();
    this.campo = null;
  }
}
