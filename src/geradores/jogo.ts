// As regras dos jogos na tela (folhas interativas, etapa 2 — 2026-11-18).
// Puras e testadas; a tela (telaJogo.ts) só desenha e escuta o dedo.
//
// Regra do app (princípio 4): nada trava e nada vira nota. Errar não tem som
// de erro nem cor de erro; a resposta aparece quando a criança pede.

import type { Achado, CacaPalavras } from './cacaPalavras';
import type { Cruzadinha, Entrada } from './cruzadinha';
import type { Sudoku } from './logica';
import { soLetras } from './comum';

export type Casa = [linha: number, coluna: number];

/**
 * As casas em linha reta de `a` até `b` — deitada, em pé ou na diagonal.
 * Fora disso (um "L", um salto de cavalo), não há linha: devolve vazio.
 */
export function linhaEntre(a: Casa, b: Casa): Casa[] {
  const dl = Math.sign(b[0] - a[0]);
  const dc = Math.sign(b[1] - a[1]);
  const passos = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
  const reta = a[0] === b[0] || a[1] === b[1] || Math.abs(b[0] - a[0]) === Math.abs(b[1] - a[1]);
  if (!reta) return [];
  return Array.from({ length: passos + 1 }, (_, k): Casa => [a[0] + dl * k, a[1] + dc * k]);
}

export const casasDoAchado = (a: Achado): Casa[] =>
  Array.from({ length: a.letras.length }, (_, k): Casa => [a.linha + a.dl * k, a.coluna + a.dc * k]);

const mesmaCasa = (x: Casa, y: Casa) => x[0] === y[0] && x[1] === y[1];

/**
 * A palavra que o dedo marcou, se marcou uma: as casas da linha têm de ser
 * EXATAMENTE as da palavra, num sentido ou no outro (quem arrasta do fim para
 * o começo também achou).
 */
export function palavraNaLinha(jogo: CacaPalavras, linha: Casa[]): Achado | undefined {
  if (linha.length < 2) return undefined;
  return jogo.achados.find((a) => {
    const casas = casasDoAchado(a);
    if (casas.length !== linha.length) return false;
    const ida = casas.every((c, k) => mesmaCasa(c, linha[k]));
    const volta = casas.every((c, k) => mesmaCasa(c, linha[linha.length - 1 - k]));
    return ida || volta;
  });
}

// ---------------------------------------------------------------------------
// Cruzadinha
// ---------------------------------------------------------------------------

export const casasDaEntrada = (e: Entrada): Casa[] =>
  Array.from({ length: e.letras.length }, (_, k): Casa =>
    e.direcao === 'horizontal' ? [e.linha, e.coluna + k] : [e.linha + k, e.coluna],
  );

/** A letra que a criança digitou, sem acento e em maiúscula (Ã vale A, ç vale C). */
export const letraLimpa = (s: string): string => soLetras(s).slice(-1);

/** As entradas que passam por esta casa (uma, ou duas no cruzamento). */
export function entradasDaCasa(jogo: Cruzadinha, casa: Casa): Entrada[] {
  return jogo.entradas.filter((e) => casasDaEntrada(e).some((c) => mesmaCasa(c, casa)));
}

/** Palavra inteira e certa? (Só se diz "certa"; nunca se marca o errado.) */
export function entradaCompleta(e: Entrada, letras: Record<string, string>): boolean {
  return casasDaEntrada(e).every(([l, c], k) => letras[`${l},${c}`] === e.letras[k]);
}

/** A próxima casa da palavra depois desta (para o cursor andar sozinho ao digitar). */
export function proximaCasa(e: Entrada, casa: Casa, passo: 1 | -1 = 1): Casa | undefined {
  const casas = casasDaEntrada(e);
  const i = casas.findIndex((c) => mesmaCasa(c, casa));
  return i < 0 ? undefined : casas[i + passo];
}

// ---------------------------------------------------------------------------
// Sudoku (2026-11-19)
// ---------------------------------------------------------------------------
//
// A criança toca a casa e depois o número (ou a figura) na fileira de baixo.
// Nada marca o erro: só se festeja a linha, a coluna, o bloco e o sudoku
// inteiro que FECHAM certos.

/** O que está na casa: a pista da folha ou o que a criança pôs (0 = vazia). */
export const valorDaCasa = (s: Sudoku, valores: Record<string, number>, l: number, c: number): number =>
  s.pistas[l][c] || valores[`${l},${c}`] || 0;

/** As casas da mesma linha, coluna e bloco desta casa. */
export function gruposDaCasa(s: Sudoku, l: number, c: number): Array<{ nome: 'linha' | 'coluna' | 'bloco'; casas: Casa[] }> {
  const [bl, bc] = s.bloco;
  const l0 = l - (l % bl);
  const c0 = c - (c % bc);
  const todas = Array.from({ length: s.lado }, (_, i) => i);
  return [
    { nome: 'linha', casas: todas.map((i): Casa => [l, i]) },
    { nome: 'coluna', casas: todas.map((i): Casa => [i, c]) },
    { nome: 'bloco', casas: todas.map((i): Casa => [l0 + Math.floor(i / bc), c0 + (i % bc)]) },
  ];
}

/** Os grupos (linha, coluna, bloco) desta casa que estão completos E certos. */
export function gruposCertos(s: Sudoku, valores: Record<string, number>, l: number, c: number): Array<'linha' | 'coluna' | 'bloco'> {
  return gruposDaCasa(s, l, c)
    .filter((g) => g.casas.every(([ll, cc]) => valorDaCasa(s, valores, ll, cc) === s.solucao[ll][cc]))
    .map((g) => g.nome);
}

export function sudokuCompleto(s: Sudoku, valores: Record<string, number>): boolean {
  return s.solucao.every((linha, l) => linha.every((v, c) => valorDaCasa(s, valores, l, c) === v));
}

/**
 * A casa da ajuda «Uma casa»: a primeira vazia, em ordem de leitura; sem
 * vazia, a primeira que não fecha. Sempre a mesma (nada sorteado).
 */
export function casaDaAjuda(s: Sudoku, valores: Record<string, number>): Casa | undefined {
  let errada: Casa | undefined;
  for (let l = 0; l < s.lado; l++) {
    for (let c = 0; c < s.lado; c++) {
      if (s.pistas[l][c]) continue;
      const v = valores[`${l},${c}`] || 0;
      if (!v) return [l, c];
      if (v !== s.solucao[l][c] && !errada) errada = [l, c];
    }
  }
  return errada;
}

/** A próxima casa vazia depois desta, em ordem de leitura (dando a volta). */
export function proximaVazia(s: Sudoku, valores: Record<string, number>, de: Casa): Casa | undefined {
  const total = s.lado * s.lado;
  const inicio = de[0] * s.lado + de[1];
  for (let k = 1; k <= total; k++) {
    const i = (inicio + k) % total;
    const l = Math.floor(i / s.lado);
    const c = i % s.lado;
    if (!valorDaCasa(s, valores, l, c)) return [l, c];
  }
  return undefined;
}
