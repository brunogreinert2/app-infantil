// Silabário: famílias silábicas, sílabas móveis para recortar e as peças de
// bingo e dominó de sílabas. A separação vem de src/conteudo/silabas.ts, que
// é SUGESTÃO: quem ensina confere (a tela avisa).

import { separarSilabas } from '../conteudo/silabas';
import { TINTA, escrever, folhaNua, n, negrito, soLetras, textoSeguro } from './comum';
import { cabecalho, face, paginar, recorte, type Folha, type Peca } from './jogosDeMesa';

const VOGAIS = ['A', 'E', 'I', 'O', 'U'];

/** "B C D" ou "B, QU, LH" → famílias, em maiúsculas, sem repetir. */
export function lerFamilias(texto: string): string[] {
  const vistas = new Set<string>();
  const familias: string[] = [];
  for (const bruta of texto.split(/[\s,;]+/)) {
    const f = soLetras(bruta);
    if (!f || f.length > 3 || vistas.has(f)) continue;
    vistas.add(f);
    familias.push(f);
  }
  return familias;
}

/** B → BA BE BI BO BU */
export const familia = (inicio: string): string[] => VOGAIS.map((v) => inicio + v);

export interface OpcoesFamilias {
  /** só a primeira sílaba vem escrita; as outras ficam para completar */
  completar?: boolean;
}

/** Sete famílias por folha, em letra grande. */
export function svgFamiliasA4(familias: string[], op: OpcoesFamilias = {}): Folha[] {
  const paginas = paginar(familias, 7);
  return paginas.map((pagina, i): Folha => {
    let corpo = cabecalho('Famílias silábicas', op.completar ? 'Leia a primeira sílaba e complete a família.' : 'Leia em voz alta, linha por linha.');
    const larg = 124;
    const alt = 118;
    const x0 = 400 - (larg * 5) / 2 + 20;
    pagina.forEach((f, l) => {
      const y = 128 + l * (alt + 14);
      corpo += negrito(escrever(f, x0 - 28, y + alt / 2 + 22, 60, 'end'), 30);
      familia(f).forEach((s, c) => {
        const x = x0 + c * larg;
        corpo += `<rect x="${n(x + 6)}" y="${n(y)}" width="${larg - 12}" height="${alt}" rx="16" fill="none" stroke="${TINTA}" stroke-width="3"/>`;
        if (!op.completar || c === 0) corpo += escrever(s, x + larg / 2, y + alt / 2 + 22, 60, 'middle', larg - 24);
      });
    });
    return { titulo: `Famílias silábicas${paginas.length > 1 ? ` ${i + 1}` : ''}`, svg: folhaNua('Famílias silábicas', corpo) };
  });
}

export interface PalavraEmSilabas {
  peca: Peca;
  silabas: string[];
  /** a separação teve dúvida e precisa de olho humano */
  conferir: boolean;
}

export function emSilabas(pecas: Peca[]): PalavraEmSilabas[] {
  return pecas
    .filter((p) => /^\p{L}+$/u.test(p.texto))
    .map((peca) => {
      const s = separarSilabas(peca.texto);
      return { peca, silabas: s.silabas, conferir: s.conferir.length > 0 };
    });
}

/**
 * Sílabas móveis: em cima, cada palavra com o desenho e as caixas vazias
 * (uma por sílaba); embaixo, as sílabas para recortar e colar. Três palavras
 * por folha. As sílabas de recortar vão em ordem alfabética: nada de sorte, e
 * a ordem não entrega a resposta.
 */
export function svgSilabasMoveisA4(palavras: PalavraEmSilabas[]): Folha[] {
  const paginas = paginar(palavras.filter((p) => p.silabas.length <= 6), 3);
  return paginas.map((pagina, i): Folha => {
    let corpo = cabecalho('Monte a palavra', 'Recorte as sílabas lá embaixo e cole cada uma na sua caixa.');
    const caixa = 96;
    pagina.forEach((p, k) => {
      const y = 120 + k * 196;
      corpo += `<rect x="48" y="${y}" width="160" height="160" rx="16" fill="none" stroke="${TINTA}" stroke-width="2.4"/>`;
      corpo += face(p.peca.figura ? p.peca : { texto: '?' }, 56, y + 8, 144, 144, p.peca.figura ? 'figura' : 'ambos');
      p.silabas.forEach((_, c) => {
        corpo += `<rect x="${n(236 + c * (caixa + 10))}" y="${y + 32}" width="${caixa}" height="${caixa}" rx="10" fill="none" stroke="${TINTA}" stroke-width="3"/>`;
      });
    });
    const soltas = pagina.flatMap((p) => p.silabas).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const colunas = 6;
    const w = 704 / colunas;
    const h = 86;
    const y0 = 720;
    soltas.forEach((s, k) => {
      corpo += escrever(s, 48 + (k % colunas) * w + w / 2, y0 + Math.floor(k / colunas) * h + h / 2 + 14, 40, 'middle', w - 16);
    });
    corpo += recorte(48, y0, w, h, colunas, Math.ceil(soltas.length / colunas));
    return { titulo: `Monte a palavra${paginas.length > 1 ? ` ${i + 1}` : ''}`, svg: folhaNua('Monte a palavra', corpo) };
  });
}

/**
 * As sílabas que viram peça de bingo ou dominó. Aceita sílabas soltas (BA, BE)
 * ou palavras inteiras (que são separadas). Peça de sílaba nunca leva desenho.
 */
export function pecasDeSilabas(texto: string): { pecas: Peca[]; separadas: string[] } {
  const vistas = new Set<string>();
  const pecas: Peca[] = [];
  const separadas: string[] = [];
  for (const bruta of texto.split(/[\s,;]+/)) {
    const palavra = textoSeguro(bruta).toLocaleUpperCase('pt-BR');
    if (!/^\p{L}+$/u.test(palavra)) continue;
    const partes = separarSilabas(palavra).silabas;
    if (partes.length > 1) separadas.push(partes.join('-'));
    for (const s of partes) {
      if (vistas.has(s)) continue;
      vistas.add(s);
      pecas.push({ texto: s });
    }
  }
  return { pecas, separadas };
}
