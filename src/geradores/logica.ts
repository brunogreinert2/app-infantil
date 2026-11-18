// Raciocínio: labirinto e sudoku. Os dois "embaralham", mas a partir de uma
// semente: o mesmo pedido dá sempre a mesma folha, e "outro" muda o número.

import { PICTOGRAMAS } from '../caa/pictogramas';
import { TINTA, escrever, folha, n, semear, sorteador } from './comum';
import { face, recorte, type Folha } from './jogosDeMesa';

// ---------------------------------------------------------------------------
// Labirinto
// ---------------------------------------------------------------------------

export type NivelLabirinto = 'facil' | 'medio' | 'dificil';
const TAMANHOS: Record<NivelLabirinto, [number, number]> = {
  facil: [6, 8],
  medio: [12, 15],
  dificil: [20, 26],
};

export interface Labirinto {
  colunas: number;
  linhas: number;
  /** paredes de cada casa: [cima, direita, baixo, esquerda] */
  paredes: boolean[][][];
  /** o caminho da entrada (0,0) à saída (última casa), casa por casa: [linha, coluna] */
  solucao: Array<[number, number]>;
}

const PASSOS: Array<[number, number, number, number]> = [
  [-1, 0, 0, 2],
  [0, 1, 1, 3],
  [1, 0, 2, 0],
  [0, -1, 3, 1],
];

/** Labirinto "perfeito" (um caminho só entre quaisquer duas casas), por busca em profundidade. */
export function gerarLabirinto(nivel: NivelLabirinto = 'facil', semente = 0): Labirinto {
  const [colunas, linhas] = TAMANHOS[nivel] ?? TAMANHOS.facil;
  const rnd = sorteador(semear(`labirinto|${nivel}`) + semente);
  const paredes = Array.from({ length: linhas }, () => Array.from({ length: colunas }, () => [true, true, true, true]));
  const visto = Array.from({ length: linhas }, () => Array<boolean>(colunas).fill(false));
  const pilha: Array<[number, number]> = [[0, 0]];
  visto[0][0] = true;
  while (pilha.length) {
    const [l, c] = pilha[pilha.length - 1];
    const livres = PASSOS.filter(([dl, dc]) => {
      const ll = l + dl;
      const cc = c + dc;
      return ll >= 0 && ll < linhas && cc >= 0 && cc < colunas && !visto[ll][cc];
    });
    if (!livres.length) {
      pilha.pop();
      continue;
    }
    const [dl, dc, aqui, la] = livres[Math.floor(rnd() * livres.length)];
    paredes[l][c][aqui] = false;
    paredes[l + dl][c + dc][la] = false;
    visto[l + dl][c + dc] = true;
    pilha.push([l + dl, c + dc]);
  }
  paredes[0][0][3] = false; // entrada à esquerda, no alto
  paredes[linhas - 1][colunas - 1][1] = false; // saída à direita, embaixo

  // caminho pela busca em largura
  const de = new Map<string, string>();
  const fila: Array<[number, number]> = [[0, 0]];
  de.set('0,0', '');
  while (fila.length) {
    const [l, c] = fila.shift()!;
    if (l === linhas - 1 && c === colunas - 1) break;
    PASSOS.forEach(([dl, dc, aqui]) => {
      const chave = `${l + dl},${c + dc}`;
      if (!paredes[l][c][aqui] && l + dl >= 0 && l + dl < linhas && c + dc >= 0 && c + dc < colunas && !de.has(chave)) {
        de.set(chave, `${l},${c}`);
        fila.push([l + dl, c + dc]);
      }
    });
  }
  const solucao: Array<[number, number]> = [];
  for (let chave = `${linhas - 1},${colunas - 1}`; chave; chave = de.get(chave) ?? '') {
    solucao.unshift(chave.split(',').map(Number) as [number, number]);
  }
  return { colunas, linhas, paredes, solucao };
}

export function svgLabirintoA4(lab: Labirinto, op: { respostas?: boolean; titulo?: string } = {}): string {
  const casa = Math.min(704 / lab.colunas, 860 / lab.linhas);
  const x0 = 400 - (casa * lab.colunas) / 2;
  const y0 = 186;
  let d = '';
  for (let l = 0; l < lab.linhas; l++) {
    for (let c = 0; c < lab.colunas; c++) {
      const x = x0 + c * casa;
      const y = y0 + l * casa;
      const [cima, direita, baixo, esquerda] = lab.paredes[l][c];
      if (cima) d += `M${n(x)} ${n(y)}H${n(x + casa)}`;
      if (esquerda) d += `M${n(x)} ${n(y)}V${n(y + casa)}`;
      if (direita) d += `M${n(x + casa)} ${n(y)}V${n(y + casa)}`;
      if (baixo && l === lab.linhas - 1) d += `M${n(x)} ${n(y + casa)}H${n(x + casa)}`;
    }
  }
  const grossura = Math.max(3, casa * 0.09);
  let corpo = `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${n(grossura)}" stroke-linecap="square"/>`;
  corpo += escrever('ENTRADA', x0, y0 - 14, 18);
  corpo += escrever('SAÍDA', x0 + casa * lab.colunas, y0 + casa * lab.linhas + 30, 18, 'end');
  if (op.respostas) {
    const pontos = lab.solucao.map(([l, c]) => `${n(x0 + (c + 0.5) * casa)} ${n(y0 + (l + 0.5) * casa)}`);
    pontos.unshift(`${n(x0 - casa * 0.4)} ${n(y0 + casa * 0.5)}`);
    pontos.push(`${n(x0 + casa * (lab.colunas + 0.4))} ${n(y0 + casa * (lab.linhas - 0.5))}`);
    corpo += `<path d="M${pontos.join('L')}" fill="none" stroke="${TINTA}" stroke-width="${n(Math.min(6, Math.max(2.5, casa * 0.06)))}" stroke-dasharray="${n(Math.min(10, casa * 0.12))} ${n(Math.min(8, casa * 0.1))}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  const titulo = op.titulo ?? 'Labirinto';
  return folha(op.respostas ? `${titulo} — respostas` : titulo, 'Labirinto', corpo, { nome: !op.respostas });
}

// ---------------------------------------------------------------------------
// Sudoku
// ---------------------------------------------------------------------------

export interface Sudoku {
  lado: 4 | 6;
  /** linhas × colunas de cada bloco */
  bloco: [number, number];
  solucao: number[][];
  /** 0 = casa vazia */
  pistas: number[][];
}

function contarSolucoes(grade: number[][], lado: number, bloco: [number, number], limite = 2): number {
  for (let l = 0; l < lado; l++) {
    for (let c = 0; c < lado; c++) {
      if (grade[l][c]) continue;
      let total = 0;
      for (let v = 1; v <= lado; v++) {
        if (!pode(grade, l, c, v, lado, bloco)) continue;
        grade[l][c] = v;
        total += contarSolucoes(grade, lado, bloco, limite - total);
        grade[l][c] = 0;
        if (total >= limite) return total;
      }
      return total;
    }
  }
  return 1;
}

function pode(grade: number[][], l: number, c: number, v: number, lado: number, [bl, bc]: [number, number]): boolean {
  for (let i = 0; i < lado; i++) if (grade[l][i] === v || grade[i][c] === v) return false;
  const l0 = l - (l % bl);
  const c0 = c - (c % bc);
  for (let i = 0; i < bl; i++) for (let j = 0; j < bc; j++) if (grade[l0 + i][c0 + j] === v) return false;
  return true;
}

/**
 * Sudoku com UMA solução só. 4 × 4 (blocos 2 × 2) ou 6 × 6 (blocos 2 × 3).
 * `pistas` é quantas casas vêm preenchidas (o mínimo possível pode ser maior).
 */
export function gerarSudoku(lado: 4 | 6 = 4, semente = 0, pistas?: number): Sudoku {
  const bloco: [number, number] = lado === 4 ? [2, 2] : [2, 3];
  const rnd = sorteador(semear(`sudoku|${lado}`) + semente);
  const embaralhar = <T,>(xs: T[]): T[] => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  // grade válida de partida, depois trocas que mantêm as regras
  const [bl, bc] = bloco;
  const base = Array.from({ length: lado }, (_, l) =>
    Array.from({ length: lado }, (_, c) => ((bc * (l % bl) + Math.floor(l / bl) + c) % lado) + 1),
  );
  const simbolos = embaralhar(Array.from({ length: lado }, (_, i) => i + 1));
  const faixas = embaralhar(Array.from({ length: lado / bl }, (_, i) => i));
  const ordemLinhas = faixas.flatMap((f) => embaralhar(Array.from({ length: bl }, (_, i) => f * bl + i)));
  const pilhas = embaralhar(Array.from({ length: lado / bc }, (_, i) => i));
  const ordemColunas = pilhas.flatMap((p) => embaralhar(Array.from({ length: bc }, (_, i) => p * bc + i)));
  const solucao = ordemLinhas.map((l) => ordemColunas.map((c) => simbolos[base[l][c] - 1]));

  const alvo = pistas ?? (lado === 4 ? 7 : 16);
  const grade = solucao.map((linha) => [...linha]);
  let restantes = lado * lado;
  for (const casa of embaralhar(Array.from({ length: lado * lado }, (_, i) => i))) {
    if (restantes <= alvo) break;
    const l = Math.floor(casa / lado);
    const c = casa % lado;
    const antes = grade[l][c];
    grade[l][c] = 0;
    if (contarSolucoes(grade.map((x) => [...x]), lado, bloco) !== 1) grade[l][c] = antes;
    else restantes--;
  }
  return { lado, bloco, solucao, pistas: grade };
}

/** Quatro figuras para o sudoku de figuras (4 × 4). */
export const FIGURAS_DO_SUDOKU = ['fruta', 'casa', 'onibus', 'livro'].filter((f) => PICTOGRAMAS[f]);

export function svgSudokuA4(s: Sudoku, op: { respostas?: boolean; figuras?: boolean } = {}): string {
  const figuras = op.figuras && s.lado === 4;
  const tamanho = figuras ? 480 : 560;
  const casa = tamanho / s.lado;
  const x0 = 400 - tamanho / 2;
  const y0 = 200;
  let corpo = '';
  const vazias: number[] = [];
  for (let l = 0; l < s.lado; l++) {
    for (let c = 0; c < s.lado; c++) {
      const dado = s.pistas[l][c];
      const v = dado || (op.respostas ? s.solucao[l][c] : 0);
      if (!dado) vazias.push(s.solucao[l][c]);
      if (!v) continue;
      const x = x0 + c * casa;
      const y = y0 + l * casa;
      if (figuras) corpo += face({ texto: '', figura: FIGURAS_DO_SUDOKU[v - 1] }, x + 6, y + 6, casa - 12, casa - 12, 'figura');
      else {
        const t = escrever(String(v), x + casa / 2, y + casa / 2 + casa * 0.2, casa * 0.56, 'middle');
        corpo += dado ? t : t.replace(`fill="${TINTA}"`, 'fill="#6b6b6b"');
      }
    }
  }
  let finas = '';
  for (let i = 1; i < s.lado; i++) {
    finas += `M${n(x0 + i * casa)} ${y0}V${y0 + tamanho}M${x0} ${n(y0 + i * casa)}H${x0 + tamanho}`;
  }
  let grossas = '';
  for (let i = s.bloco[1]; i < s.lado; i += s.bloco[1]) grossas += `M${n(x0 + i * casa)} ${y0}V${y0 + tamanho}`;
  for (let i = s.bloco[0]; i < s.lado; i += s.bloco[0]) grossas += `M${x0} ${n(y0 + i * casa)}H${x0 + tamanho}`;
  corpo += `<path d="${finas}" fill="none" stroke="${TINTA}" stroke-width="2"/>`;
  corpo += `<path d="${grossas}" fill="none" stroke="${TINTA}" stroke-width="6"/>`;
  corpo += `<rect x="${x0}" y="${y0}" width="${tamanho}" height="${tamanho}" fill="none" stroke="${TINTA}" stroke-width="7"/>`;
  const regra = figuras
    ? 'Cada figura aparece uma vez em cada linha, em cada coluna e em cada quadrado grosso.'
    : `Os números de 1 a ${s.lado} aparecem uma vez em cada linha, em cada coluna e em cada bloco grosso.`;
  corpo += escrever(regra, 400, y0 + tamanho + 46, 18, 'middle', 704);
  if (figuras && !op.respostas && vazias.length) {
    // as figuras que faltam, para recortar e colar (ou só olhar e desenhar)
    vazias.sort((a, b) => a - b);
    const w = 704 / 6;
    const y = y0 + tamanho + 84;
    corpo += escrever('Recorte e cole:', 48, y - 12, 18);
    vazias.forEach((v, k) => {
      corpo += face({ texto: '', figura: FIGURAS_DO_SUDOKU[v - 1] }, 48 + (k % 6) * w + 10, y + Math.floor(k / 6) * w + 10, w - 20, w - 20, 'figura');
    });
    corpo += recorte(48, y, w, w, 6, Math.ceil(vazias.length / 6));
  }
  const titulo = figuras ? 'Sudoku de figuras' : `Sudoku ${s.lado} × ${s.lado}`;
  return folha(op.respostas ? `${titulo} — respostas` : titulo, 'Sudoku', corpo, { nome: !op.respostas });
}

export function folhasDeLogica(
  modelo: 'labirinto' | 'sudoku4' | 'sudoku6' | 'sudokuFiguras',
  op: { nivel: NivelLabirinto; semente: number; respostas: boolean },
): Folha[] {
  const folhas: Folha[] = [];
  if (modelo === 'labirinto') {
    const lab = gerarLabirinto(op.nivel, op.semente);
    folhas.push({ titulo: 'Labirinto', svg: svgLabirintoA4(lab) });
    if (op.respostas) folhas.push({ titulo: 'Labirinto — respostas', svg: svgLabirintoA4(lab, { respostas: true }) });
    return folhas;
  }
  const s = gerarSudoku(modelo === 'sudoku6' ? 6 : 4, op.semente);
  const figuras = modelo === 'sudokuFiguras';
  folhas.push({ titulo: 'Sudoku', svg: svgSudokuA4(s, { figuras }) });
  if (op.respostas) folhas.push({ titulo: 'Sudoku — respostas', svg: svgSudokuA4(s, { figuras, respostas: true }) });
  return folhas;
}
