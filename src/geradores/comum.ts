// Peças comuns dos geradores de folhas (caça-palavras, cruzadinha, papéis).
//
// Receita de todo gerador desta pasta:
//  - função pura: dados simples entram, SVG A4 sai (viewBox 800 × 1131, o mesmo
//    das folhas de alfabeto, então o motor de impressão já sabe imprimir);
//  - SEM sorte: a mesma entrada dá sempre a mesma folha. Onde é preciso
//    embaralhar, o embaralho nasce de uma semente que sai da própria entrada;
//  - o modelo (onde está cada palavra) é separado do desenho, para um dia a
//    mesma brincadeira existir também na tela.

export const TINTA = '#000000';
export const FOLHA = { largura: 800, altura: 1131, esquerda: 48, direita: 752 };

import { linha, quadro, type Identidade } from '../conteudo/alfabetoArte';
import legendas from '../conteudo/glifos-legendas.json';
import outras from './letras.json';

// ---------------------------------------------------------------------------
// A letra das folhas. Sempre em caminhos vetoriais (nunca <text>): a folha sai
// igual em qualquer aparelho e no papel. Atkinson Hyperlegible é a padrão (a
// mesma das legendas do app); Cardo e OpenDyslexic vêm de scripts/gera-glifos.mjs.
// ---------------------------------------------------------------------------

type Glifo = { d: string; adv: number };
export type Letra = 'atkinson' | 'cardo' | 'opendyslexic';

export const NOMES_DAS_LETRAS: Record<Letra, string> = {
  atkinson: 'Atkinson Hyperlegible (sem serifa, a padrão)',
  cardo: 'Cardo (com serifa, zero sem risco)',
  opendyslexic: 'OpenDyslexic (para dislexia)',
};

const TABELAS: Record<Letra, Record<string, Glifo>> = {
  atkinson: legendas as Record<string, Glifo>,
  cardo: (outras as Record<string, Record<string, Glifo>>).cardo,
  opendyslexic: (outras as Record<string, Record<string, Glifo>>).opendyslexic,
};

export type Estilo = 'normal' | 'negrito' | 'italico';

export const NOMES_DOS_ESTILOS: Record<Estilo, string> = {
  normal: 'Normal',
  negrito: 'Negrito',
  italico: 'Itálico',
};

/** Negrito e itálico de VERDADE, das próprias fontes (`letras.json`). */
const VARIANTES = outras as Record<string, Record<string, Glifo>>;

let letraAtual: Letra = 'atkinson';
let estiloAtual: Estilo = 'normal';

// ---------------------------------------------------------------------------
// CASAS PARA PINTAR (folhas interativas, etapa 2 — 2026-11-18). Numa grade
// desenhada com linhas (calendário, sudoku, caça-palavras, quadriculado) o
// balde não tem onde cair: a casa não existe como forma. Com as casas ligadas,
// os geradores desenham cada casa como um retângulo invisível, que vira
// região na tela de pintura — o domingo do calendário pinta-se de vermelho.
//
// SÓ PARA PINTAR: na folha impressa as casas não existem (`casa()` devolve
// vazio), e por isso a folha do papel e o código dela não mudam.
// ---------------------------------------------------------------------------
let casasLigadas = false;

export function comCasas<T>(fazer: () => T): T {
  const antes = casasLigadas;
  casasLigadas = true;
  try {
    return fazer();
  } finally {
    casasLigadas = antes;
  }
}

/** Uma casa retangular para pintar (vazio na folha impressa). `cor` = cor de partida. */
export function casa(x: number, y: number, w: number, h: number, cor = 'none'): string {
  if (!casasLigadas) return '';
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${cor}" stroke="none" data-casa="1"/>`;
}

/** Uma casa de forma qualquer (um caminho fechado: a fatia da fração). */
export function casaD(d: string, cor = 'none'): string {
  if (!casasLigadas) return '';
  return `<path d="${d}" fill="${cor}" stroke="none" data-casa="1"/>`;
}

/** As casas estão ligadas? (O tabuleiro troca as casas escuras por casas pintáveis.) */
export const pintando = (): boolean => casasLigadas;

// ---------------------------------------------------------------------------
// FOLHA AMPLIADA (pedido do Bruno, 2026-11-20): um liga/desliga a mais, para
// enxergar melhor — o que já existe continua igual com ele desligado (e o
// código da folha também). Ligado:
//   - em TODA folha (ampliarFolha): letra mais grossa, traço 1,6× mais grosso,
//     cinza escurecido (linha-guia clara some para quem vê pouco);
//   - onde o desenho deixa (caça-palavras, cruzadinha, contas), os geradores
//     leem `ampliada()` e fazem casas e letras maiores, menos itens por folha.
// ---------------------------------------------------------------------------
let ampliadaLigada = false;

export function comAmpliada<T>(ligada: boolean | undefined, fazer: () => T): T {
  const antes = ampliadaLigada;
  ampliadaLigada = Boolean(ligada);
  try {
    return fazer();
  } finally {
    ampliadaLigada = antes;
  }
}

/** A folha que está sendo feita é a ampliada? */
export const ampliada = (): boolean => ampliadaLigada;

/** Engrossa uma folha pronta: traço, letra e cinzas (ver o bloco acima). */
export function ampliarFolha(svg: string): string {
  return (
    svg
      // traços 1,6× (antes de engrossar a letra, para não multiplicar o dela)
      .replace(/stroke-width="([\d.]+)"/g, (_, v: string) => `stroke-width="${n(Number(v) * 1.6)}"`)
      // a letra: contorno da própria tinta por fora do desenho (≈ 4% da letra)
      .replace(
        new RegExp(`fill="${TINTA}" stroke="none" pointer-events="none"`, 'g'),
        `fill="${TINTA}" stroke="${TINTA}" stroke-width="40" stroke-linejoin="round" pointer-events="none"`,
      )
      // cinza (r = g = b) do meio para baixo: metade da luz; o quase branco fica
      .replace(/#([0-9a-f]{2})\1\1\b/gi, (cor, v: string) => {
        const nivel = parseInt(v, 16);
        if (nivel < 0x30 || nivel > 0xe0) return cor;
        const novo = Math.round(nivel * 0.5).toString(16).padStart(2, '0');
        return `#${novo}${novo}${novo}`;
      })
  );
}

/** Escreve em negrito ou itálico e volta ao de antes. Vale para medir e para desenhar. */
export function comEstilo<T>(estilo: Estilo | undefined, fazer: () => T): T {
  const antes = estiloAtual;
  estiloAtual = estilo && estilo in NOMES_DOS_ESTILOS ? estilo : 'normal';
  try {
    return fazer();
  } finally {
    estiloAtual = antes;
  }
}

/** A letra em uso agora (a de `comLetra`) e a tabela dos desenhos dela. */
export const letraEmUso = (): Letra => letraAtual;
export const tabelaDaLetra = (letra: Letra): Record<string, Glifo> => TABELAS[letra];

/** Faz as folhas com outra letra e volta para a de antes, aconteça o que acontecer. */
export function comLetra<T>(letra: Letra | undefined, fazer: () => T): T {
  const antes = letraAtual;
  letraAtual = letra && TABELAS[letra] ? letra : 'atkinson';
  try {
    return fazer();
  } finally {
    letraAtual = antes;
  }
}

/**
 * O desenho de um caractere: na variante pedida (negrito, itálico) da letra
 * escolhida; se ela não tiver o caractere, na letra normal; e por fim na Atkinson.
 */
const glifo = (c: string): Glifo | undefined =>
  (estiloAtual !== 'normal' ? VARIANTES[`${letraAtual}-${estiloAtual}`]?.[c] : undefined) ?? TABELAS[letraAtual][c] ?? TABELAS.atkinson[c];

/**
 * Largura do texto. `espaco` é o ar extra entre as letras, em fração do
 * tamanho (0,2 = um quinto da letra), como nos títulos espaçados das capas.
 */
export function largura(s: string, tamanho: number, espaco = 0): number {
  const letras = [...s];
  const ar = espaco * tamanho * Math.max(0, letras.length - 1);
  return letras.reduce((soma, c) => soma + (glifo(c)?.adv ?? 0) * (tamanho / 1000), 0) + ar;
}

const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const idioma = (s: string) => (/[\u0370-\u03ff\u1f00-\u1fff]/u.test(s) ? 'grc' : 'pt-BR');

function texto(s: string, x: number, y: number, tamanho = 22, ancora: 'start' | 'middle' | 'end' = 'start', espaco = 0): string {
  const total = largura(s, tamanho, espaco);
  let atual = x - (ancora === 'middle' ? total / 2 : ancora === 'end' ? total : 0);
  const caminhos = [...s]
    .map((c) => {
      const g = glifo(c);
      if (!g) return '';
      const p = g.d ? `<path d="${g.d}" transform="translate(${atual.toFixed(2)} ${y}) scale(${tamanho / 1000})"/>` : '';
      atual += (g.adv * tamanho) / 1000 + espaco * tamanho;
      return p;
    })
    .join('');
  return `<g role="img" aria-label="${escHtml(s)}" lang="${idioma(s)}" fill="${TINTA}" stroke="none" pointer-events="none">${caminhos}</g>`;
}


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
    .replace(/[\u0300-\u036f]/gu, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

/** Tira o que a letra não sabe desenhar (emoji, símbolo raro). */
export function textoSeguro(s: string): string {
  return [...s.normalize('NFC')].filter((c) => c === ' ' || (glifo(c)?.adv ?? 0) > 0).join('').replace(/\s+/g, ' ').trim();
}

/** `texto()` que nunca lança e encolhe até caber em `max`. */
export function escrever(
  s: string,
  x: number,
  y: number,
  tamanho: number,
  ancora: 'start' | 'middle' | 'end' = 'start',
  max = Infinity,
  espaco = 0,
): string {
  const limpo = textoSeguro(s);
  if (!limpo) return '';
  const cabe = Math.min(tamanho, (max / largura(limpo, 1000, espaco)) * 1000);
  return texto(limpo, x, y, Number(cabe.toFixed(2)), ancora, espaco);
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
