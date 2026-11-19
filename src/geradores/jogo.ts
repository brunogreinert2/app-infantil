// As regras dos jogos na tela (folhas interativas, etapa 2 — 2026-11-18).
// Puras e testadas; a tela (telaJogo.ts) só desenha e escuta o dedo.
//
// Regra do app (princípio 4): nada trava e nada vira nota. Errar não tem som
// de erro nem cor de erro; a resposta aparece quando a criança pede.

import type { Achado, CacaPalavras } from './cacaPalavras';
import type { Cruzadinha, Entrada } from './cruzadinha';
import type { Labirinto, Sudoku } from './logica';
import type { Conta } from './contas';
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

// ---------------------------------------------------------------------------
// Labirinto (2026-11-19)
// ---------------------------------------------------------------------------
//
// O caminho da criança começa na entrada (0,0) e anda casa a casa, só por
// onde não há parede. Voltar por cima do próprio rastro APAGA o pedaço (como
// tirar o lápis); a parede simplesmente não deixa passar — sem som nem cor
// de erro.

/** A parede entre duas casas vizinhas (índice em `paredes`: cima, direita, baixo, esquerda). */
function ladoEntre(a: Casa, b: Casa): number | undefined {
  const dl = b[0] - a[0];
  const dc = b[1] - a[1];
  if (dl === -1 && dc === 0) return 0;
  if (dl === 0 && dc === 1) return 1;
  if (dl === 1 && dc === 0) return 2;
  if (dl === 0 && dc === -1) return 3;
  return undefined;
}

/** Dá para ir de `a` à vizinha `b` sem atravessar parede? */
export function podePassar(lab: Labirinto, a: Casa, b: Casa): boolean {
  const lado = ladoEntre(a, b);
  if (lado === undefined) return false;
  if (b[0] < 0 || b[1] < 0 || b[0] >= lab.linhas || b[1] >= lab.colunas) return false;
  return !lab.paredes[a[0]][a[1]][lado];
}

export const SAIDA = (lab: Labirinto): Casa => [lab.linhas - 1, lab.colunas - 1];

/**
 * O caminho depois de o dedo chegar a `casa`:
 *  - uma casa do próprio rastro: o caminho volta até ela (apaga o resto);
 *  - na mesma linha ou coluna da ponta, com o corredor livre: anda até lá
 *    (o dedo rápido pula casas; o corredor reto as preenche);
 *  - qualquer outra (parede, diagonal, longe): o caminho fica como estava.
 */
export function andarAte(lab: Labirinto, caminho: Casa[], casa: Casa): Casa[] {
  const k = caminho.findIndex((c) => mesmaCasa(c, casa));
  if (k >= 0) return caminho.slice(0, k + 1);
  const ponta = caminho[caminho.length - 1];
  if (!ponta || (ponta[0] !== casa[0] && ponta[1] !== casa[1])) return caminho;
  const passo: Casa = [Math.sign(casa[0] - ponta[0]), Math.sign(casa[1] - ponta[1])];
  const novo = [...caminho];
  let aqui = ponta;
  while (!mesmaCasa(aqui, casa)) {
    const prox: Casa = [aqui[0] + passo[0], aqui[1] + passo[1]];
    if (!podePassar(lab, aqui, prox)) return caminho;
    // cruzar o próprio rastro no meio do corredor: volta até lá
    const j = novo.findIndex((c) => mesmaCasa(c, prox));
    if (j >= 0) return novo.slice(0, j + 1);
    novo.push(prox);
    aqui = prox;
  }
  return novo;
}

/** Chegou à saída? */
export const chegou = (lab: Labirinto, caminho: Casa[]): boolean => {
  const ponta = caminho[caminho.length - 1];
  return !!ponta && mesmaCasa(ponta, SAIDA(lab));
};

/** Um caminho guardado ainda vale para este labirinto? (casa a casa, sem atravessar parede) */
export function caminhoValido(lab: Labirinto, caminho: unknown): caminho is Casa[] {
  if (!Array.isArray(caminho) || !caminho.length) return false;
  if (!mesmaCasa(caminho[0] as Casa, [0, 0])) return false;
  return caminho.every((c, i) => i === 0 || podePassar(lab, caminho[i - 1] as Casa, c as Casa));
}

/**
 * A ajuda «Um pedaço»: o caminho certo até onde a criança acertou, mais
 * alguns passos (sempre os mesmos — nada sorteado).
 */
export function pedacoDaSolucao(lab: Labirinto, caminho: Casa[], passos = 5): Casa[] {
  let certo = 0;
  while (certo < caminho.length && certo < lab.solucao.length && mesmaCasa(caminho[certo], lab.solucao[certo] as Casa)) certo++;
  return lab.solucao.slice(0, Math.min(lab.solucao.length, Math.max(1, certo) + passos)) as Casa[];
}

// ---------------------------------------------------------------------------
// Contas (2026-11-19)
// ---------------------------------------------------------------------------
//
// Uma conta por vez. ARMADA (+, −, ×) como no caderno: a resposta se escreve
// da direita para a esquerda, a unidade primeiro, em caixas alinhadas pela
// direita. DEITADA (÷ e a tabuada): «84 ÷ 4 =» e as caixas, da esquerda para
// a direita. Nada marca o erro: a conta certa ganha ✓; a errada só não ganha.

/** A conta fica deitada? (divisão e tabuada; o resto, armada) */
export const contaDeitada = (c: Conta, tabuada = false): boolean => tabuada || c.op === '/';

/** Quantas caixas de resposta: na armada, o espaço do caderno; na deitada, o tamanho da resposta. */
export function caixasDaConta(c: Conta, deitada: boolean): number {
  const t = (x: number) => String(x).length;
  if (deitada) return t(c.resultado);
  if (c.op === '+') return Math.max(t(c.a), t(c.b)) + 1;
  if (c.op === 'x') return t(c.a) + 1;
  return Math.max(t(c.a), t(c.b));
}

/** A resposta certa, caixa a caixa, alinhada pela direita ('' nas da frente). */
export function respostaEmCaixas(c: Conta, n: number): string[] {
  const s = String(c.resultado);
  return Array.from({ length: n }, (_, i) => s[s.length - n + i] ?? '');
}

/** O número escrito nas caixas (as vazias da frente não contam); buraco no meio = ainda não. */
export function valorDasCaixas(caixas: string[]): number | undefined {
  let i = 0;
  while (i < caixas.length && !caixas[i]) i++;
  const resto = caixas.slice(i);
  if (!resto.length || resto.some((d) => !/^[0-9]$/.test(d))) return undefined;
  return Number(resto.join(''));
}

export const contaCerta = (c: Conta, caixas: string[] | undefined): boolean =>
  !!caixas && valorDasCaixas(caixas) === c.resultado;

/** A ordem em que se escreve: armada, da direita para a esquerda; deitada, ao contrário. */
export const ordemDasCaixas = (n: number, deitada: boolean): number[] =>
  Array.from({ length: n }, (_, k) => (deitada ? k : n - 1 - k));

/**
 * A ajuda «Um algarismo»: na ordem de escrever, a primeira caixa que não
 * bate com a resposta passa a bater. Sempre a mesma (nada sorteado).
 */
export function umAlgarismo(c: Conta, caixas: string[], deitada: boolean): string[] {
  const certo = respostaEmCaixas(c, caixas.length);
  const novo = [...caixas];
  for (const i of ordemDasCaixas(caixas.length, deitada)) {
    if (novo[i] !== certo[i]) {
      novo[i] = certo[i];
      // na armada, as caixas da frente que sobram ficam vazias de uma vez
      if (certo[i] !== '' || deitada) return novo;
    }
  }
  return novo;
}
