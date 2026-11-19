// Jogos de mesa para imprimir e recortar: memória, dominó e bingo.
//
// As peças saem de uma lista de palavras. Palavra que tem desenho na
// biblioteca da prancha (src/caa/pictogramas.ts) ganha o desenho; as outras
// ficam só com a palavra — então o mesmo jogo serve para figuras, para
// palavras do Ler o Mundo, para nomes da turma.
//
// Sem sorte no que o app faz: a mesma lista dá as mesmas folhas. O sorteio do
// bingo é de papel (as fichas de chamar vão para um saquinho).

import { NOMES_DOS_PICTOGRAMAS, PICTOGRAMAS } from '../caa/pictogramas';
import { TINTA, escrever, folhaNua, mm, n, semear, soLetras, sorteador, textoSeguro, casa as casaPintavel, pintando } from './comum';

export interface Peca {
  /** em maiúsculas, como nas placas e na prancha */
  texto: string;
  /** chave de um desenho de PICTOGRAMAS, se houver */
  figura?: string;
}

const CHAVE_POR_NOME = new Map<string, string>();
for (const chave of Object.keys(PICTOGRAMAS)) {
  CHAVE_POR_NOME.set(soLetras(chave), chave);
  const nome = NOMES_DOS_PICTOGRAMAS[chave];
  if (nome) CHAVE_POR_NOME.set(soLetras(nome), chave);
}

/** Os nomes que têm desenho, para a tela mostrar a quem ensina. */
export const NOMES_COM_DESENHO: string[] = Object.keys(PICTOGRAMAS).map((c) => NOMES_DOS_PICTOGRAMAS[c] ?? c);

/** Uma peça por linha (vírgula e ponto e vírgula também separam); repetidas saem. */
export function lerPecas(texto: string): Peca[] {
  const vistas = new Set<string>();
  const pecas: Peca[] = [];
  for (const bruta of texto.split(/[\n,;]+/)) {
    const limpo = textoSeguro(bruta).toLocaleUpperCase('pt-BR');
    const chave = soLetras(limpo);
    if (!limpo || vistas.has(chave || limpo)) continue;
    vistas.add(chave || limpo);
    pecas.push({ texto: limpo, figura: CHAVE_POR_NOME.get(chave) });
  }
  return pecas;
}

export type Face = 'ambos' | 'figura' | 'palavra';

/** O conteúdo de uma peça, centrado na caixa (sem a borda). */
export function face(p: Peca, x: number, y: number, w: number, h: number, mostrar: Face = 'ambos'): string {
  const temFigura = Boolean(p.figura && PICTOGRAMAS[p.figura]) && mostrar !== 'palavra';
  const temPalavra = mostrar !== 'figura' || !temFigura;
  const folga = Math.min(w, h) * 0.08;
  let s = '';
  const alturaPalavra = temPalavra ? (temFigura ? h * 0.24 : h) : 0;
  if (temFigura) {
    const lado = Math.min(w - folga * 2, h - alturaPalavra - folga * 1.5);
    const fx = x + (w - lado) / 2;
    const fy = y + folga + (h - alturaPalavra - folga * 1.5 - lado) / 2;
    const grupo = `<g transform="translate(${n(fx)} ${n(fy)}) scale(${n(lado / 100)})" color="${TINTA}" fill="none" stroke="${TINTA}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${PICTOGRAMAS[p.figura!]}</g>`;
    // na tela de pintura o desenho vai marcado: as formas fechadas dele (o
    // rosto, a boca, a lataria do ônibus) viram partes pintáveis, separadas
    // do fundo da carta. Na folha impressa, nada muda.
    s += pintando() ? `<!--desenho-->${grupo}<!--/desenho-->` : grupo;
  }
  if (temPalavra) {
    const tam = temFigura ? alturaPalavra * 0.62 : Math.min(h * 0.3, w * 0.24);
    const base = temFigura ? y + h - alturaPalavra * 0.36 : y + h / 2 + tam * 0.36;
    s += escrever(p.texto, x + w / 2, base, tam, 'middle', w - folga * 2);
  }
  return s;
}

/** Linhas de recorte de uma grade de peças coladas umas nas outras. */
export function recorte(x0: number, y0: number, w: number, h: number, colunas: number, linhas: number): string {
  // cada peça de recortar é uma casa para pintar (cartas, pedras, fichas, cartões)
  let casas = '';
  for (let l = 0; l < linhas; l++) for (let c = 0; c < colunas; c++) casas += casaPintavel(x0 + c * w, y0 + l * h, w, h);
  let d = '';
  for (let c = 0; c <= colunas; c++) d += `M${n(x0 + c * w)} ${n(y0)}V${n(y0 + linhas * h)}`;
  for (let l = 0; l <= linhas; l++) d += `M${n(x0)} ${n(y0 + l * h)}H${n(x0 + colunas * w)}`;
  return casas + `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="1.6" stroke-dasharray="9 7"/>`;
}

export const cabecalho = (titulo: string, como: string): string =>
  escrever(titulo, 48, 56, 26) + escrever(como, 48, 86, 16, 'start', 704);

export interface Folha {
  titulo: string;
  svg: string;
}

export function paginar<T>(itens: T[], porFolha: number): T[][] {
  const paginas: T[][] = [];
  for (let i = 0; i < itens.length; i += porFolha) paginas.push(itens.slice(i, i + porFolha));
  return paginas;
}

// ---------------------------------------------------------------------------
// Memória
// ---------------------------------------------------------------------------

export interface OpcoesMemoria {
  /**
   * 'igual': as duas cartas do par são iguais (figura e palavra).
   * 'leitura': uma carta tem a figura, a outra só a palavra — achar o par é ler.
   */
  par?: 'igual' | 'leitura';
  /** junta uma folha de verso (para imprimir atrás e a carta não ficar transparente) */
  verso?: boolean;
}

/** 12 cartas por folha (6 pares), de 55 mm. No máximo 24 pares. */
export function svgMemoriaA4(pecas: Peca[], op: OpcoesMemoria = {}): Folha[] {
  const leitura = op.par === 'leitura';
  const cartas: Array<{ p: Peca; mostrar: Face }> = [];
  for (const p of pecas.slice(0, 24)) {
    const comFigura = Boolean(p.figura);
    cartas.push({ p, mostrar: leitura && comFigura ? 'figura' : 'ambos' });
    cartas.push({ p, mostrar: leitura ? 'palavra' : 'ambos' });
  }
  const lado = 232;
  const x0 = (800 - lado * 3) / 2;
  const y0 = 112;
  const paginas = paginar(cartas, 12);
  const folhas = paginas.map((pagina, i): Folha => {
    let corpo = cabecalho(
      'Jogo da memória',
      leitura ? 'Recorte no tracejado. O par é a figura com a sua palavra.' : 'Recorte no tracejado. O par são duas cartas iguais.',
    );
    pagina.forEach((c, k) => {
      corpo += face(c.p, x0 + (k % 3) * lado, y0 + Math.floor(k / 3) * lado, lado, lado, c.mostrar);
    });
    corpo += recorte(x0, y0, lado, lado, 3, Math.ceil(pagina.length / 3));
    return { titulo: `Memória ${i + 1} de ${paginas.length}`, svg: folhaNua('Jogo da memória', corpo) };
  });
  if (op.verso && folhas.length) {
    // um desenho só, igual em todas as cartas, alinhado com a frente
    let corpo = cabecalho('Verso das cartas', 'Imprima esta folha atrás de cada folha de cartas.');
    for (let k = 0; k < 12; k++) {
      const x = x0 + (k % 3) * lado;
      const y = y0 + Math.floor(k / 3) * lado;
      let d = '';
      for (let t = 30; t < lado * 2 - 30; t += 22) {
        const a = Math.max(18, t - lado + 18);
        const b = Math.min(t - 18, lado - 18);
        if (b > a) d += `M${n(x + a)} ${n(y + t - a)}L${n(x + b)} ${n(y + t - b)}`;
      }
      corpo += `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="3" stroke-linecap="round"/>`;
      corpo += `<rect x="${n(x + 14)}" y="${n(y + 14)}" width="${lado - 28}" height="${lado - 28}" rx="16" fill="none" stroke="${TINTA}" stroke-width="3"/>`;
    }
    folhas.push({ titulo: 'Memória — verso', svg: folhaNua('Verso das cartas', corpo) });
  }
  return folhas;
}

// ---------------------------------------------------------------------------
// Dominó
// ---------------------------------------------------------------------------

/**
 * Todas as combinações de duas figuras, inclusive a dobrada (CASA–CASA), como
 * no dominó de pontos: 7 figuras dão as 28 pedras clássicas; 6 dão 21; 5, 15.
 */
export function gerarDomino(pecas: Peca[]): Array<[Peca, Peca]> {
  const usadas = pecas.slice(0, 7);
  const pedras: Array<[Peca, Peca]> = [];
  for (let i = 0; i < usadas.length; i++) {
    for (let j = i; j < usadas.length; j++) pedras.push([usadas[i], usadas[j]]);
  }
  return pedras;
}

/** 14 pedras por folha, de 80 × 32 mm. */
export function svgDominoA4(pecas: Peca[]): Folha[] {
  const pedras = gerarDomino(pecas);
  const w = 340;
  const h = 134;
  const x0 = (800 - w * 2) / 2;
  const y0 = 112;
  const paginas = paginar(pedras, 14);
  return paginas.map((pagina, i): Folha => {
    let corpo = cabecalho('Dominó', 'Recorte no tracejado. Encoste as metades iguais.');
    pagina.forEach(([a, b], k) => {
      const x = x0 + (k % 2) * w;
      const y = y0 + Math.floor(k / 2) * h;
      corpo += face(a, x, y, w / 2, h) + face(b, x + w / 2, y, w / 2, h);
      corpo += `<path d="M${n(x + w / 2)} ${n(y + 10)}V${n(y + h - 10)}" fill="none" stroke="${TINTA}" stroke-width="4" stroke-linecap="round"/>`;
    });
    corpo += recorte(x0, y0, w, h, 2, Math.ceil(pagina.length / 2));
    return { titulo: `Dominó ${i + 1} de ${paginas.length}`, svg: folhaNua('Dominó', corpo) };
  });
}

// ---------------------------------------------------------------------------
// Bingo
// ---------------------------------------------------------------------------

export interface OpcoesBingo {
  /** quantas cartelas (1 a 40) */
  cartelas?: number;
  /** 3 = cartela de 9 casas; 4 = de 16 */
  lado?: 3 | 4;
  semente?: number;
}

/**
 * Cartelas todas diferentes entre si (nenhuma com o mesmo conjunto de casas).
 * Devolve menos cartelas do que o pedido se a lista não der para tantas.
 */
export function gerarBingo(pecas: Peca[], op: OpcoesBingo = {}): Peca[][] {
  const lado = op.lado ?? 3;
  const casas = lado * lado;
  if (pecas.length < casas) return [];
  const quantas = Math.min(40, Math.max(1, Math.round(op.cartelas ?? 6)));
  const rnd = sorteador(semear(pecas.map((p) => p.texto).join('|') + `|${lado}`) + (op.semente ?? 0));
  const vistas = new Set<string>();
  const cartelas: Peca[][] = [];
  for (let tentativa = 0; cartelas.length < quantas && tentativa < quantas * 60; tentativa++) {
    // embaralho de Fisher–Yates com a sequência da semente
    const ordem = pecas.map((_, i) => i);
    for (let i = ordem.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
    }
    const escolhidas = ordem.slice(0, casas);
    const chave = [...escolhidas].sort((a, b) => a - b).join(',');
    if (vistas.has(chave)) continue;
    vistas.add(chave);
    cartelas.push(escolhidas.map((i) => pecas[i]));
  }
  return cartelas;
}

/** Duas cartelas por folha, mais as fichas de chamar (para sortear de um saquinho). */
export function svgBingoA4(pecas: Peca[], op: OpcoesBingo = {}): Folha[] {
  const lado = op.lado ?? 3;
  const cartelas = gerarBingo(pecas, op);
  const tamanho = 432;
  const casa = tamanho / lado;
  const x0 = (800 - tamanho) / 2;
  const folhas = paginar(cartelas, 2).map((par, i): Folha => {
    let corpo = '';
    par.forEach((cartela, k) => {
      const y0 = 96 + k * 520;
      const numero = i * 2 + k + 1;
      corpo += escrever(`BINGO — cartela ${numero}`, x0, y0 - 16, 24);
      cartela.forEach((p, c) => {
        corpo += casaPintavel(x0 + (c % lado) * casa, y0 + Math.floor(c / lado) * casa, casa, casa);
        corpo += face(p, x0 + (c % lado) * casa, y0 + Math.floor(c / lado) * casa, casa, casa);
      });
      let d = '';
      for (let t = 1; t < lado; t++) d += `M${n(x0 + t * casa)} ${n(y0)}V${n(y0 + tamanho)}M${n(x0)} ${n(y0 + t * casa)}H${n(x0 + tamanho)}`;
      corpo += `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="2.4"/>`;
      corpo += `<rect x="${n(x0)}" y="${n(y0)}" width="${tamanho}" height="${tamanho}" rx="14" fill="none" stroke="${TINTA}" stroke-width="5"/>`;
    });
    if (par.length === 2) corpo += `<path d="M24 566H776" fill="none" stroke="${TINTA}" stroke-width="1.6" stroke-dasharray="9 7"/>`;
    return { titulo: `Bingo — cartelas ${i * 2 + 1}${par.length === 2 ? ` e ${i * 2 + 2}` : ''}`, svg: folhaNua('Cartelas de bingo', corpo) };
  });
  if (!cartelas.length) return [];
  const w = 176;
  const h = 150;
  const xf = (800 - w * 4) / 2;
  paginar(pecas, 24).forEach((pagina, i, todas) => {
    let corpo = cabecalho('Fichas de chamar', 'Recorte, ponha num saquinho e tire uma de cada vez.');
    pagina.forEach((p, k) => {
      corpo += face(p, xf + (k % 4) * w, 112 + Math.floor(k / 4) * h, w, h);
    });
    corpo += recorte(xf, 112, w, h, 4, Math.ceil(pagina.length / 4));
    folhas.push({ titulo: `Bingo — fichas de chamar${todas.length > 1 ? ` ${i + 1}` : ''}`, svg: folhaNua('Fichas de chamar', corpo) });
  });
  return folhas;
}

// ---------------------------------------------------------------------------
// Tabuleiro de damas e xadrez, com as peças de recortar
// ---------------------------------------------------------------------------


const CASA_ESCURA = '#bdbdbd'; // cinza: gasta pouca tinta e a peça escura ainda aparece em cima

/**
 * Tabuleiro 8 × 8 com casas de 22 mm (o mesmo serve a damas e a xadrez).
 * A casa do canto inferior direito é clara, como manda a regra dos dois jogos.
 */
export function svgTabuleiroA4(op: { coordenadas?: boolean; titulo?: string } = {}): string {
  const casa = mm(22);
  const x0 = (800 - casa * 8) / 2;
  const y0 = 150;
  let corpo = escrever(op.titulo ?? 'Tabuleiro', 400, 84, 30, 'middle');
  for (let l = 0; l < 8; l++) {
    for (let c = 0; c < 8; c++) {
      // na tela de pintura, as 64 casas são pintáveis (a escura começa cinza)
      if (pintando()) corpo += casaPintavel(x0 + c * casa, y0 + l * casa, casa, casa, (l + c) % 2 === 1 ? CASA_ESCURA : 'none');
      else if ((l + c) % 2 === 1) {
        corpo += `<rect x="${n(x0 + c * casa)}" y="${n(y0 + l * casa)}" width="${n(casa)}" height="${n(casa)}" fill="${CASA_ESCURA}"/>`;
      }
    }
  }
  let d = '';
  for (let t = 0; t <= 8; t++) d += `M${n(x0 + t * casa)} ${n(y0)}V${n(y0 + casa * 8)}M${n(x0)} ${n(y0 + t * casa)}H${n(x0 + casa * 8)}`;
  corpo += `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="1.6"/>`;
  corpo += `<rect x="${n(x0)}" y="${n(y0)}" width="${n(casa * 8)}" height="${n(casa * 8)}" fill="none" stroke="${TINTA}" stroke-width="5"/>`;
  if (op.coordenadas ?? true) {
    for (let t = 0; t < 8; t++) {
      corpo += escrever('abcdefgh'[t], x0 + casa * (t + 0.5), y0 + casa * 8 + 30, 22, 'middle');
      corpo += escrever(String(8 - t), x0 - 16, y0 + casa * (t + 0.5) + 8, 22, 'middle');
    }
  }
  return folhaNua('Tabuleiro de damas e xadrez', corpo);
}

/** Uma peça redonda de 19 mm: clara (só contorno) ou escura (cheia). */
function disco(cx: number, cy: number, escura: boolean, letra = '', coroa = false): string {
  const r = mm(9.5);
  let s = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${escura ? TINTA : '#ffffff'}" stroke="${TINTA}" stroke-width="3"/>`;
  const dentro = escura ? '#ffffff' : TINTA;
  if (coroa || !letra) {
    s += `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r * (coroa ? 0.72 : 0.6))}" fill="none" stroke="${dentro}" stroke-width="${coroa ? 4 : 2}"/>`;
  }
  if (coroa) s += `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r * 0.44)}" fill="none" stroke="${dentro}" stroke-width="4"/>`;
  if (letra) {
    const t = escrever(letra, cx, cy + r * 0.42, r * 1.2, 'middle');
    s += escura ? t.replace(`fill="${TINTA}"`, 'fill="#ffffff"') : t;
  }
  return s;
}

function fileira(pecas: string[], y: number, desenhar: (cx: number, cy: number, i: number) => string): string {
  const passo = mm(22);
  const x0 = 400 - (passo * (pecas.length - 1)) / 2;
  return pecas.map((_, i) => desenhar(x0 + i * passo, y, i)).join('');
}

/** 12 pedras claras e 12 escuras, mais 4 damas de cada cor (dois aros). */
export function svgPecasDamasA4(): string {
  let corpo = cabecalho('Peças de damas', 'Recorte as rodelas. As de dois aros são as damas: troque quando a pedra chegar ao outro lado.');
  const seis = Array<string>(6).fill('');
  const quatro = Array<string>(4).fill('');
  const passo = mm(24);
  let y = 170;
  for (const escura of [false, true]) {
    corpo += escrever(escura ? 'Escuras' : 'Claras', 48, y - 56, 20);
    for (let l = 0; l < 2; l++) corpo += fileira(seis, y + l * passo, (cx, cy) => disco(cx, cy, escura));
    corpo += fileira(quatro, y + 2 * passo, (cx, cy) => disco(cx, cy, escura, '', true));
    y += passo * 3 + 90;
  }
  return folhaNua('Peças de damas', corpo);
}

const XADREZ: Array<{ letra: string; nome: string; quantas: number }> = [
  { letra: 'R', nome: 'Rei', quantas: 1 },
  { letra: 'D', nome: 'Dama', quantas: 1 },
  { letra: 'T', nome: 'Torre', quantas: 2 },
  { letra: 'B', nome: 'Bispo', quantas: 2 },
  { letra: 'C', nome: 'Cavalo', quantas: 2 },
  { letra: 'P', nome: 'Peão', quantas: 8 },
];

/**
 * As 32 peças de xadrez como rodelas com a letra da peça (R, D, T, B, C, P —
 * a notação brasileira), claras e escuras, e a legenda.
 */
export function svgPecasXadrezA4(): string {
  let corpo = cabecalho('Peças de xadrez', 'Recorte as rodelas. A letra diz qual é a peça.');
  const passo = mm(24);
  let y = 180;
  for (const escura of [false, true]) {
    corpo += escrever(escura ? 'Escuras' : 'Claras', 48, y - 60, 20);
    const grandes = XADREZ.filter((x) => x.letra !== 'P').flatMap((x) => Array<string>(x.quantas).fill(x.letra));
    corpo += fileira(grandes, y, (cx, cy, i) => disco(cx, cy, escura, grandes[i]));
    const peoes = Array<string>(8).fill('P');
    corpo += fileira(peoes, y + passo, (cx, cy) => disco(cx, cy, escura, 'P'));
    y += passo * 2 + 110;
  }
  corpo += escrever(XADREZ.map((x) => `${x.letra} = ${x.nome}`).join('   ·   ').replace(/\s+/g, ' '), 400, y - 30, 20, 'middle', 704);
  corpo += escrever('Na primeira fila: T C B D R B C T. Na frente, os oito peões. A dama começa na casa da sua cor.', 400, y + 4, 17, 'middle', 704);
  return folhaNua('Peças de xadrez', corpo);
}
