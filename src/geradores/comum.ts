// Peças comuns dos geradores de folhas (caça-palavras, cruzadinha, papéis).
//
// Receita de todo gerador desta pasta:
//  - função pura: dados simples entram, SVG A4 sai (viewBox 800 × 1131, o mesmo
//    das folhas de alfabeto, então o motor de impressão já sabe imprimir);
//  - SEM sorte: a mesma entrada dá sempre a mesma folha. Onde é preciso
//    embaralhar, o embaralho nasce de uma semente que sai da própria entrada;
//  - o modelo (onde está cada palavra) é separado do desenho, para um dia a
//    mesma brincadeira existir também na tela.

import { largura, linha, quadro, texto, type Identidade } from '../conteudo/alfabetoArte';

export const TINTA = '#000000';
export const FOLHA = { largura: 800, altura: 1131, esquerda: 48, direita: 752 };

/**
 * A folha de 800 unidades é impressa com 190 mm de largura (A4 menos 10 mm de
 * margem de cada lado — ver motorImpressao.ts). `mm(10)` = 1 cm no papel,
 * desde que a impressão saia em tamanho real (100%).
 */
export const UNIDADES_POR_MM = 800 / 190;
export const mm = (v: number): number => Number((v * UNIDADES_POR_MM).toFixed(2));
export const n = (v: number): string => String(Number(v.toFixed(2)));

/** Sem marca de criança: estas folhas servem do 1º ano ao ensino médio. */
export const IDENTIDADE_NEUTRA: Identidade = {
  marca: '',
  descricao: 'Folha A4 para imprimir. {categoria}.',
  rodapeEsquerda: '',
  rodapeDireita: '',
};

/** Número estável a partir de um texto (FNV-1a). */
export function semear(s: string): number {
  let h = 0x811c9dc5;
  for (const c of s) {
    h ^= c.codePointAt(0)!;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Sequência "embaralhada" que se repete igual para a mesma semente (mulberry32). */
export function sorteador(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** PÃO DE QUEIJO → PAODEQUEIJO: só letras A–Z, para as casas da grade. */
export function soLetras(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/gu, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

/** Tira o que a letra das legendas não sabe desenhar (emoji, símbolo raro). */
export function textoSeguro(s: string): string {
  return [...s.normalize('NFC')].filter((c) => c === ' ' || largura(c, 1000) > 0).join('').replace(/\s+/g, ' ').trim();
}

/** `texto()` que nunca lança e encolhe até caber em `max`. */
export function escrever(
  s: string,
  x: number,
  y: number,
  tamanho: number,
  ancora: 'start' | 'middle' | 'end' = 'start',
  max = Infinity,
): string {
  const limpo = textoSeguro(s);
  if (!limpo) return '';
  const cabe = Math.min(tamanho, (max / largura(limpo, 1000)) * 1000);
  return texto(limpo, x, y, Number(cabe.toFixed(2)), ancora);
}

/** Engrossa um texto já desenhado (a letra das legendas só tem um peso). */
export function negrito(svgDoTexto: string, forca = 36): string {
  return svgDoTexto.replace('stroke="none"', `stroke="${TINTA}" stroke-width="${forca}" stroke-linejoin="round"`);
}

/** Contorno branco por trás do texto, para número que cai em cima de linha. */
export function comHalo(svgDoTexto: string, forca = 260): string {
  return svgDoTexto.replace('stroke="none"', `stroke="#ffffff" stroke-width="${forca}" stroke-linejoin="round"`).replace(`fill="${TINTA}"`, 'fill="#ffffff"') + svgDoTexto;
}

/** Quebra em linhas que cabem em `max`; devolve as linhas, não o desenho. */
export function quebrar(s: string, max: number, tamanho: number): string[] {
  const linhas: string[] = [];
  let atual = '';
  for (const palavra of textoSeguro(s).split(' ')) {
    const teste = atual ? `${atual} ${palavra}` : palavra;
    if (largura(teste, tamanho) > max && atual) {
      linhas.push(atual);
      atual = palavra;
    } else atual = teste;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * Folha com cabeçalho: título, linha de nome e data (opcional) e o corpo.
 * O corpo começa em y = 170 (com nome) ou 130 (sem) e vai até 1050.
 */
export function folha(
  titulo: string,
  categoria: string,
  corpo: string,
  op: { nome?: boolean; identidade?: Identidade } = {},
): string {
  const id = op.identidade ?? IDENTIDADE_NEUTRA;
  const t = textoSeguro(titulo) || categoria;
  const nome = op.nome ?? true;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1131" data-folha-a4="true" role="img" aria-label="${esc(t)}" stroke-linecap="round" stroke-linejoin="round">
<title>${esc(t)}</title><desc>${esc(id.descricao.replace('{categoria}', categoria))}</desc>
${quadro('regiao-fundo', 0, 0, 800, 1131, 0)}
${id.marca ? texto(id.marca, 48, 43, 17) : ''}${escrever(categoria, 752, 43, 15, 'end')}
${linha(48, 58, 752, 58)}${escrever(t, 48, 108, 38, 'start', 704)}
${nome ? texto('Nome:', 48, 147, 18) + linha(112, 148, 515, 148) + texto('Data:', 540, 147, 18) + linha(594, 148, 752, 148) : ''}
${corpo}
${id.rodapeEsquerda ? texto(id.rodapeEsquerda, 48, 1096, 16) : ''}${id.rodapeDireita ? texto(id.rodapeDireita, 752, 1096, 16, 'end') : ''}
</svg>`;
}

/** Folha sem cabeçalho nenhum: papel pautado, quadriculado, régua. */
export function folhaNua(titulo: string, corpo: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1131" data-folha-a4="true" role="img" aria-label="${esc(titulo)}">
<title>${esc(titulo)}</title>
<rect x="0" y="0" width="800" height="1131" fill="#ffffff"/>
${corpo}
</svg>`;
}

/** Traço simples, com grossura em unidades da folha. */
export function risco(x1: number, y1: number, x2: number, y2: number, grossura: number, extra = ''): string {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${TINTA}" stroke-width="${n(grossura)}"${extra}/>`;
}
