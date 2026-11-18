// Contas armadas (as quatro operações) e tabuada, com gabarito.
// As contas saem de uma semente: a mesma folha sempre; "outras contas" muda.

import { TINTA, escrever, folha, n, semear, sorteador } from './comum';
import { paginar, type Folha } from './jogosDeMesa';

export type Operacao = '+' | '-' | 'x' | '/';

export interface Conta {
  a: number;
  b: number;
  op: Operacao;
  resultado: number;
}

export interface PedidoContas {
  operacao: Operacao;
  /** quantos algarismos tem o primeiro número (1 a 4) */
  algarismos: number;
  /** com "vai um" / "empresta" (adição e subtração) */
  reagrupar: boolean;
  quantas: number;
  semente?: number;
}

const SINAL: Record<Operacao, string> = { '+': '+', '-': '–', x: '×', '/': '÷' };

const digitos = (v: number): number[] => String(v).split('').map(Number);

function precisaReagrupar(a: number, b: number, op: Operacao): boolean {
  const da = digitos(a).reverse();
  const db = digitos(b).reverse();
  for (let i = 0; i < da.length; i++) {
    if (op === '+' && da[i] + (db[i] ?? 0) >= 10) return true;
    if (op === '-' && da[i] < (db[i] ?? 0)) return true;
  }
  return false;
}

export function gerarContas(p: PedidoContas): Conta[] {
  const alg = Math.min(4, Math.max(1, Math.round(p.algarismos)));
  const quantas = Math.min(40, Math.max(1, Math.round(p.quantas)));
  const rnd = sorteador(semear(`contas|${p.operacao}|${alg}|${p.reagrupar}`) + (p.semente ?? 0));
  const entre = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));
  const min = alg === 1 ? 1 : 10 ** (alg - 1);
  const max = 10 ** alg - 1;
  const contas: Conta[] = [];
  const vistas = new Set<string>();
  for (let t = 0; contas.length < quantas && t < quantas * 400; t++) {
    let a = entre(min, max);
    let b: number;
    let resultado: number;
    switch (p.operacao) {
      case '+':
        b = entre(alg === 1 ? 1 : min, max);
        resultado = a + b;
        if (alg > 1 && precisaReagrupar(a, b, '+') !== p.reagrupar) continue;
        break;
      case '-':
        b = entre(1, a);
        resultado = a - b;
        if (alg > 1 && precisaReagrupar(a, b, '-') !== p.reagrupar) continue;
        break;
      case 'x':
        b = entre(2, 9);
        resultado = a * b;
        break;
      case '/':
        // divisão exata: escolhe o quociente e o divisor e monta o dividendo
        b = entre(2, 9);
        resultado = entre(Math.max(1, Math.ceil(min / b)), Math.floor(max / b));
        a = resultado * b;
        if (a < min) continue;
        break;
    }
    const chave = `${a}${p.operacao}${b}`;
    if (vistas.has(chave)) continue;
    vistas.add(chave);
    contas.push({ a, b, op: p.operacao, resultado });
  }
  return contas;
}

/**
 * As contas que a professora escreve, uma por linha: "345 + 278", "50 - 7",
 * "12 x 3" (ou * ou ×), "84 ÷ 4" (ou / ou :). Mistura de operações vale.
 * O que não serve volta em `fora`, com o motivo: subtração que fica negativa,
 * divisão que não é exata, número grande demais.
 */
export function lerContas(texto: string): { contas: Conta[]; fora: Array<{ linha: string; motivo: string }> } {
  const contas: Conta[] = [];
  const fora: Array<{ linha: string; motivo: string }> = [];
  for (const bruta of texto.split('\n')) {
    const linha = bruta.trim();
    if (!linha) continue;
    const m = linha.replace(/\s+/g, '').match(/^(\d{1,6})([+\-–−xX×*÷/:])(\d{1,6})=?$/u);
    if (!m) {
      fora.push({ linha, motivo: 'não entendi; escreva assim: 345 + 278' });
      continue;
    }
    const a = Number(m[1]);
    const b = Number(m[3]);
    const sinal = m[2];
    const op: Operacao = sinal === '+' ? '+' : /[-–−]/u.test(sinal) ? '-' : /[xX×*]/u.test(sinal) ? 'x' : '/';
    if (op === '-' && b > a) {
      fora.push({ linha, motivo: 'o resultado ficaria negativo' });
      continue;
    }
    if (op === '/' && (b === 0 || a % b !== 0)) {
      fora.push({ linha, motivo: b === 0 ? 'não se divide por zero' : `a divisão não é exata (sobra ${a % b})` });
      continue;
    }
    const resultado = op === '+' ? a + b : op === '-' ? a - b : op === 'x' ? a * b : a / b;
    contas.push({ a, b, op, resultado });
  }
  return { contas: contas.slice(0, 40), fora };
}

/** Uma conta armada, com uma casa por algarismo; `x`,`y` = canto de cima à esquerda. */
function contaArmada(c: Conta, x: number, y: number, w: number, respostas: boolean): string {
  const casa = 40;
  const tam = 34;
  let s = '';
  if (c.op === '/') {
    // à brasileira: dividendo | divisor, chave, quociente embaixo do divisor
    const da = String(c.a);
    const xa = x + 12;
    const xd = xa + da.length * casa + 14;
    da.split('').forEach((d, i) => (s += escrever(d, xa + i * casa + casa / 2, y + 44, tam, 'middle')));
    s += escrever(String(c.b), xd + 14, y + 44, tam);
    s += `<path d="M${xd} ${y + 8}V${y + 60}H${n(Math.min(x + w - 10, xd + 90))}" fill="none" stroke="${TINTA}" stroke-width="3"/>`;
    const q = String(c.resultado);
    for (let i = 0; i < q.length; i++) {
      const bx = xd + 10 + i * casa;
      s += `<rect x="${bx}" y="${y + 70}" width="${casa - 6}" height="${casa + 4}" rx="5" fill="none" stroke="${TINTA}" stroke-width="1.6"/>`;
      if (respostas) s += escrever(q[i], bx + (casa - 6) / 2, y + 104, tam, 'middle');
    }
    return s;
  }
  const largura = Math.max(String(c.a).length, String(c.b).length, String(c.resultado).length);
  const xd = x + w - 20 - largura * casa; // coluna mais à esquerda
  const coluna = (i: number) => xd + i * casa + casa / 2;
  const alinhar = (v: number) => String(v).padStart(largura, ' ');
  // casinhas do "vai um" em cima (adição e multiplicação)
  if (c.op === '+' || c.op === 'x') {
    for (let i = 0; i < largura - 1; i++) {
      s += `<rect x="${n(coluna(i) - 10)}" y="${y}" width="20" height="20" rx="3" fill="none" stroke="${TINTA}" stroke-width="1.2" stroke-dasharray="3 3"/>`;
    }
  }
  alinhar(c.a).split('').forEach((d, i) => d !== ' ' && (s += escrever(d, coluna(i), y + 62, tam, 'middle')));
  alinhar(c.b).split('').forEach((d, i) => d !== ' ' && (s += escrever(d, coluna(i), y + 104, tam, 'middle')));
  s += escrever(SINAL[c.op], xd - 26, y + 104, tam, 'middle');
  s += `<path d="M${n(xd - 44)} ${y + 118}H${n(xd + largura * casa)}" stroke="${TINTA}" stroke-width="3.4" stroke-linecap="round"/>`;
  const r = alinhar(c.resultado);
  for (let i = 0; i < largura; i++) {
    s += `<rect x="${n(xd + i * casa + 3)}" y="${y + 126}" width="${casa - 6}" height="${casa + 6}" rx="5" fill="none" stroke="${TINTA}" stroke-width="1.6"/>`;
    if (respostas && r[i] !== ' ') s += escrever(r[i], coluna(i), y + 162, tam, 'middle');
  }
  return s;
}

const NOMES: Record<Operacao, string> = { '+': 'Adição', '-': 'Subtração', x: 'Multiplicação', '/': 'Divisão' };

/** Doze contas por folha (três colunas, quatro linhas); dez, se for divisão. */
export function svgContasA4(contas: Conta[], op: { respostas?: boolean } = {}): Folha[] {
  if (!contas.length) return [];
  // contas misturadas (as da professora podem ser) levam o título geral
  const titulo = contas.every((c) => c.op === contas[0].op) ? NOMES[contas[0].op] : 'Contas';
  // a divisão armada é larga (dividendo, chave e quociente lado a lado): duas por linha
  const divisao = contas.some((c) => c.op === '/');
  const colunas = divisao ? 2 : 3;
  const porFolha = divisao ? 10 : 12;
  const w = 704 / colunas;
  const h = divisao ? 172 : 214;
  const paginas = paginar(contas, porFolha);
  const fazer = (respostas: boolean) =>
    paginas.map((pagina, i): Folha => {
      let corpo = '';
      pagina.forEach((c, k) => {
        const x = 48 + (k % colunas) * w;
        const y = 180 + Math.floor(k / colunas) * h;
        corpo += escrever(`${i * porFolha + k + 1})`, x, y + 26, 18);
        corpo += contaArmada(c, x + 20, y, w - 20, respostas);
      });
      const nome = `${titulo}${paginas.length > 1 ? ` ${i + 1}` : ''}${respostas ? ' — respostas' : ''}`;
      return { titulo: nome, svg: folha(nome, 'Contas armadas', corpo, { nome: !respostas }) };
    });
  return [...fazer(false), ...(op.respostas ? fazer(true) : [])];
}

/** A tabuada de um número (× 1 a × 10), para completar ou já preenchida. */
export function svgTabuadaA4(numero: number, op: { completar?: boolean } = {}): string {
  const t = Math.min(20, Math.max(1, Math.round(numero)));
  let corpo = '';
  for (let i = 1; i <= 10; i++) {
    const y = 236 + (i - 1) * 84;
    const conta = `${t} × ${i} =`;
    corpo += escrever(conta, 420, y, 52, 'end');
    if (op.completar) corpo += `<rect x="446" y="${y - 50}" width="150" height="66" rx="10" fill="none" stroke="${TINTA}" stroke-width="2.4"/>`;
    else corpo += escrever(String(t * i), 450, y, 52);
  }
  return folha(`Tabuada do ${t}`, 'Tabuada', corpo, { nome: Boolean(op.completar) });
}

/** A tábua de Pitágoras 10 × 10: em branco (para completar) ou preenchida. */
export function svgTabuaA4(op: { completar?: boolean } = {}): string {
  const casa = 62;
  const x0 = 400 - casa * 5.5;
  const y0 = 190;
  let corpo = '';
  for (let l = 0; l <= 10; l++) {
    for (let c = 0; c <= 10; c++) {
      const x = x0 + c * casa;
      const y = y0 + l * casa;
      const cabeca = l === 0 || c === 0;
      if (l === 0 && c === 0) {
        corpo += escrever('×', x + casa / 2, y + casa / 2 + 12, 34, 'middle');
        continue;
      }
      if (cabeca) {
        corpo += `<rect x="${n(x)}" y="${n(y)}" width="${casa}" height="${casa}" fill="#d9d9d9"/>`;
        corpo += escrever(String(l || c), x + casa / 2, y + casa / 2 + 11, 30, 'middle');
      } else if (!op.completar || l === c) {
        corpo += escrever(String(l * c), x + casa / 2, y + casa / 2 + 9, 24, 'middle');
      }
    }
  }
  let d = '';
  for (let i = 0; i <= 11; i++) d += `M${n(x0 + i * casa)} ${y0}V${y0 + casa * 11}M${n(x0)} ${n(y0 + i * casa)}H${n(x0 + casa * 11)}`;
  corpo += `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="1.8"/>`;
  corpo += `<rect x="${n(x0)}" y="${y0}" width="${casa * 11}" height="${casa * 11}" fill="none" stroke="${TINTA}" stroke-width="4"/>`;
  if (op.completar) corpo += escrever('A diagonal (os quadrados) já vem pronta. Complete o resto.', 400, y0 + casa * 11 + 44, 19, 'middle');
  return folha('Tábua da multiplicação', 'Tabuada', corpo, { nome: Boolean(op.completar) });
}
