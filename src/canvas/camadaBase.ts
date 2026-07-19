// Camada base: o SVG real com regiões preenchíveis (balde de tinta).
// O clique cai num <path>/<rect>/<circle> com class="colorir-alvo" e o
// navegador resolve qual região foi tocada via event.target — sem
// matemática de ponto-em-polígono (ESPECIFICACAO.md 8.2).

export class CamadaBase {
  readonly svg: SVGSVGElement;
  private aoTocar: ((regiaoId: string) => void) | null = null;

  constructor(container: HTMLElement, svgFonte: string) {
    container.insertAdjacentHTML('beforeend', svgFonte);
    this.svg = container.querySelector('svg:last-of-type') as SVGSVGElement;
    this.svg.classList.add('camada-base');

    this.svg.addEventListener('click', (ev) => {
      const alvo = (ev.target as Element).closest('.colorir-alvo');
      if (alvo && alvo.id && this.aoTocar) this.aoTocar(alvo.id);
    });
  }

  aoTocarRegiao(cb: (regiaoId: string) => void): void {
    this.aoTocar = cb;
  }

  pintar(regiaoId: string, cor: string): void {
    const el = this.svg.querySelector<SVGElement>(`#${CSS.escape(regiaoId)}`);
    if (el) el.setAttribute('fill', cor);
  }

  corDe(regiaoId: string): string {
    const el = this.svg.querySelector<SVGElement>(`#${CSS.escape(regiaoId)}`);
    return el?.getAttribute('fill') ?? '#ffffff';
  }

  aplicarEstado(regioes: Record<string, string>): void {
    for (const [id, cor] of Object.entries(regioes)) this.pintar(id, cor);
  }
}

// Deriva a camada de linhas (só contorno, nunca recebe clique) da MESMA
// arte-fonte — uma arte, três papéis (colorir, contorno, impressão P&B).
export function criarCamadaLinhas(container: HTMLElement, svgFonte: string): SVGSVGElement {
  container.insertAdjacentHTML('beforeend', svgFonte);
  const svg = container.querySelector('svg:last-of-type') as SVGSVGElement;
  svg.classList.add('camada-linhas');
  svg.style.pointerEvents = 'none';
  for (const el of svg.querySelectorAll<SVGElement>('.colorir-alvo')) {
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke', '#1a1a1a');
    el.setAttribute('stroke-width', '4');
    el.setAttribute('stroke-linejoin', 'round');
  }
  return svg;
}

// Versão P&B para impressão em papel (usada pelo motorImpressao).
export function derivarContornoPB(svgFonte: string): string {
  const molde = document.createElement('div');
  molde.innerHTML = svgFonte;
  const svg = molde.querySelector('svg')!;
  for (const el of svg.querySelectorAll<SVGElement>('.colorir-alvo')) {
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke', '#000000');
    el.setAttribute('stroke-width', '3');
    el.setAttribute('stroke-linejoin', 'round');
  }
  return svg.outerHTML;
}
