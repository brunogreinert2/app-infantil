// Ornamentos de moldura para as folhas (capas, e depois qualquer folha).
//
// Decisão do Bruno (2026-11-18): o meandro grego é UMA opção, não o padrão
// fixo — a porta fica aberta para outros ornamentos. Para criar um novo:
// acrescentar o nome em ORNAMENTOS e um `case` em `moldura()`. Tudo em traço
// preto, que sai bem na fotocópia.

import { TINTA, n } from './comum';

export type Ornamento = 'meandro' | 'filete' | 'pontilhado' | 'nenhum';

export const ORNAMENTOS: Record<Ornamento, string> = {
  meandro: 'Meandro grego',
  filete: 'Filete duplo',
  pontilhado: 'Pontinhos',
  nenhum: 'Sem moldura',
};

/** Largura da faixa do ornamento, em unidades da folha (800 = 190 mm). */
export const FAIXA = 30;

// ---------------------------------------------------------------------------
// O MEANDRO É A GREGA DO PEDRA ANGULAR, e é a FÓRMULA que está copiada:
// `app-leitura/src/components/GregaMeandro.tsx` (a mesma que o Gerador usa).
// Uma célula de 14 × 16 com a LINHA DE BASE embaixo (y = 15) e a volta subindo
// dela — as células se ligam pela base, e por isso o friso é contínuo.
// A primeira versão daqui desenhava chaves soltas, cada uma girada sozinha, e
// a moldura "não fechava" (Bruno, 2026-11-18). Se a fórmula do app-leitura
// mudar, esta muda junto (N56: duas cópias, uma verdade).
// ---------------------------------------------------------------------------
export const GREGA_CELULA = 14;
export const GREGA_ALTURA = 16;
export const GREGA_D_DEITADA = 'M0,15H14M3,15V1H13V11H7V5H9';
/** A mesma célula em pé: x e y trocados (V ↔ H). A base fica à direita. */
export const GREGA_D_EM_PE = 'M15,0V14M15,3H1V13H11V7H5V9';

/** O traçado de N células deitadas: uma base corrida e N voltas. */
export function gregaTracado(n: number): string {
  const partes = [`M0,15H${GREGA_CELULA * n}`];
  for (let i = 0; i < n; i++) {
    const x = GREGA_CELULA * i;
    partes.push(`M${x + 3},15V1H${x + 13}V11H${x + 7}V5H${x + 9}`);
  }
  return partes.join('');
}

/** O traçado de N células em pé (para os lados da moldura). */
export function gregaTracadoEmPe(n: number): string {
  const partes = [`M15,0V${GREGA_CELULA * n}`];
  for (let i = 0; i < n; i++) {
    const y = GREGA_CELULA * i;
    partes.push(`M15,${y + 3}H1V${y + 13}H11V${y + 7}H5V${y + 9}`);
  }
  return partes.join('');
}

/**
 * Uma faixa de grega na folha. `espelho` vira a faixa para a BASE ficar
 * voltada para o texto nos quatro lados (como no Gerador): em cima a base já
 * está embaixo; embaixo, espelha na vertical; à esquerda a base já está à
 * direita; à direita, espelha na horizontal.
 */
function faixaDeGrega(x: number, y: number, n: number, emPe: boolean, espelho: '' | 'vertical' | 'horizontal'): string {
  const escala = FAIXA / GREGA_ALTURA;
  const d = emPe ? gregaTracadoEmPe(n) : gregaTracado(n);
  const vira =
    espelho === 'vertical'
      ? ` translate(0 ${GREGA_ALTURA}) scale(1 -1)`
      : espelho === 'horizontal'
        ? ` translate(${GREGA_ALTURA} 0) scale(-1 1)`
        : '';
  // traço de 2 na célula de 16, como no app-leitura: a escala o leva à folha
  return `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" transform="translate(${n2(x)} ${n2(y)}) scale(${n2(escala)})${vira}"/>`;
}
const n2 = (v: number) => String(Number(v.toFixed(3)));

/**
 * A moldura de grega. O QUADRO NASCE DA GRADE (lição do Gerador, 2026-10-09):
 * conta-se quantas células cabem inteiras, monta-se o retângulo desse tamanho
 * e centra-se ELE — centrar cada faixa no seu vão deixava branco na junta. As
 * deitadas correm de ponta a ponta; as em pé ficam entre elas. Devolve o
 * desenho e o retângulo de dentro, onde o conteúdo pode ir.
 */
export function molduraDeGrega(x: number, y: number, w: number, h: number): { svg: string; dentro: { x: number; y: number; w: number; h: number } } {
  const cel = (FAIXA * GREGA_CELULA) / GREGA_ALTURA;
  const nh = Math.floor(w / cel);
  const largura = nh * cel;
  const nv = Math.floor((h - 2 * FAIXA) / cel);
  const altura = nv * cel + 2 * FAIXA;
  const ex = x + (w - largura) / 2;
  const ey = y + (h - altura) / 2;
  const svg =
    faixaDeGrega(ex, ey, nh, false, '') +
    faixaDeGrega(ex, ey + altura - FAIXA, nh, false, 'vertical') +
    faixaDeGrega(ex, ey + FAIXA, nv, true, '') +
    faixaDeGrega(ex + largura - FAIXA, ey + FAIXA, nv, true, 'horizontal');
  return { svg, dentro: { x: ex + FAIXA, y: ey + FAIXA, w: largura - 2 * FAIXA, h: altura - 2 * FAIXA } };
}

/**
 * A moldura inteira em volta do retângulo (x, y, w, h). O conteúdo da folha
 * deve ficar do lado de dentro, a FAIXA + 12 da borda.
 */
export function moldura(ornamento: Ornamento, x: number, y: number, w: number, h: number): string {
  const traco = (largura: number) => `fill="none" stroke="${TINTA}" stroke-width="${largura}" stroke-linecap="square" stroke-linejoin="miter"`;
  switch (ornamento) {
    case 'nenhum':
      return '';
    case 'filete':
      return (
        `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" ${traco(5)}/>` +
        `<rect x="${n(x + 12)}" y="${n(y + 12)}" width="${n(w - 24)}" height="${n(h - 24)}" ${traco(1.6)}/>`
      );
    case 'pontilhado': {
      let d = '';
      const passo = 14;
      const r = 2.6;
      const ponto = (px: number, py: number) => `M${n(px - r)} ${n(py)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
      for (let px = x; px <= x + w + 0.1; px += w / Math.round(w / passo)) {
        d += ponto(px, y) + ponto(px, y + h);
      }
      for (let py = y; py <= y + h + 0.1; py += h / Math.round(h / passo)) {
        d += ponto(x, py) + ponto(x + w, py);
      }
      return `<path d="${d}" fill="${TINTA}"/><rect x="${n(x + 14)}" y="${n(y + 14)}" width="${n(w - 28)}" height="${n(h - 28)}" ${traco(1.4)}/>`;
    }
    case 'meandro': {
      const { svg, dentro } = molduraDeGrega(x, y, w, h);
      // um filete fino por dentro, como nas capas da Oficina
      return svg + `<rect x="${n(dentro.x + 10)}" y="${n(dentro.y + 10)}" width="${n(dentro.w - 20)}" height="${n(dentro.h - 20)}" ${traco(1.4)}/>`;
    }
  }
}

/** Quanto o conteúdo deve se afastar da borda externa da moldura. */
export function recuo(ornamento: Ornamento): number {
  return ornamento === 'meandro' ? FAIXA + 40 : ornamento === 'nenhum' ? 0 : 44;
}
