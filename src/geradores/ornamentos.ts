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
export const FAIXA = 34;

/**
 * Uma chave grega numa casa de 6 × 6, centrada (o traço, 0,46, é medido nessa casa:
 * a escala o leva à grossura certa na folha) (espiral quadrada para dentro). Repetida
 * lado a lado, forma o meandro.
 */
const CHAVE = 'M-2 2.2V-2.2H2.2V1.2H-0.2V-0.2H1'; // centrada no 0,0 da casa

/** Casa do canto: quadrado com outro dentro. */
const CANTO = 'M0.8 0.8H5.2V5.2H0.8Z M2.2 2.2H3.8V3.8H2.2Z';

function faixaDeChaves(x: number, y: number, comprimento: number, giro: 0 | 90 | 180 | 270): string {
  const lado = FAIXA;
  const quantas = Math.max(1, Math.round(comprimento / lado));
  const passo = comprimento / quantas;
  const escala = lado / 6;
  let s = '';
  for (let i = 0; i < quantas; i++) {
    // cada chave é desenhada na sua casa e girada conforme o lado da moldura
    const cx = giro === 0 || giro === 180 ? x + i * passo + passo / 2 : x + lado / 2;
    const cy = giro === 0 || giro === 180 ? y + lado / 2 : y + i * passo + passo / 2;
    s += `<path d="${CHAVE}" stroke-width="0.46" transform="translate(${n(cx)} ${n(cy)}) rotate(${giro}) scale(${n(escala)})"/>`;
  }
  return s;
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
      const f = FAIXA;
      let s = `<g ${traco(2.6)}>`;
      // as bordas da faixa, por fora e por dentro
      s += `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" stroke-width="5"/>`;
      s += `<rect x="${n(x + f)}" y="${n(y + f)}" width="${n(w - 2 * f)}" height="${n(h - 2 * f)}"/>`;
      // as chaves nos quatro lados (os cantos ficam para a casa do canto)
      s += faixaDeChaves(x + f, y, w - 2 * f, 0);
      s += faixaDeChaves(x + f, y + h - f, w - 2 * f, 180);
      s += faixaDeChaves(x + w - f, y + f, h - 2 * f, 90);
      s += faixaDeChaves(x, y + f, h - 2 * f, 270);
      for (const [cx, cy] of [
        [x, y],
        [x + w - f, y],
        [x, y + h - f],
        [x + w - f, y + h - f],
      ]) {
        s += `<path d="${CANTO}" stroke-width="0.46" transform="translate(${n(cx)} ${n(cy)}) scale(${n(f / 6)})"/>`;
      }
      s += '</g>';
      // um filete fino por dentro, como nas capas da Oficina
      s += `<rect x="${n(x + f + 12)}" y="${n(y + f + 12)}" width="${n(w - 2 * f - 24)}" height="${n(h - 2 * f - 24)}" ${traco(1.4)}/>`;
      return s;
    }
  }
}

/** Quanto o conteúdo deve se afastar da borda externa da moldura. */
export function recuo(ornamento: Ornamento): number {
  return ornamento === 'meandro' ? FAIXA + 40 : ornamento === 'nenhum' ? 0 : 44;
}
