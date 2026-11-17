// Cruzadinha de qualquer lista de palavra + dica, com gabarito.
// Não há sorte nenhuma aqui: a mesma lista dá sempre a mesma grade.

import { TINTA, escrever, folha, n, quebrar, soLetras, textoSeguro } from './comum';
import type { Identidade } from '../conteudo/alfabetoArte';

export interface ItemCruzadinha {
  palavra: string;
  dica: string;
}

export interface Entrada {
  numero: number;
  direcao: 'horizontal' | 'vertical';
  palavra: string;
  letras: string;
  dica: string;
  linha: number;
  coluna: number;
}

export interface Cruzadinha {
  linhas: number;
  colunas: number;
  /** '' = casa que não existe */
  grade: string[][];
  entradas: Entrada[];
  fora: Array<{ palavra: string; motivo: string }>;
}

interface Posta {
  item: { palavra: string; letras: string; dica: string };
  l: number;
  c: number;
  horizontal: boolean;
}

const LIMITE = 15; // casas por lado: acima disso a letra fica pequena no A4

class Tabuleiro {
  casas = new Map<string, { letra: string; h: boolean; v: boolean }>();
  postas: Posta[] = [];
  minL = 0;
  maxL = 0;
  minC = 0;
  maxC = 0;

  le(l: number, c: number) {
    return this.casas.get(`${l},${c}`);
  }

  /** quantos cruzamentos a palavra faria ali; -1 se não pode */
  cabe(letras: string, l: number, c: number, horizontal: boolean): number {
    const dl = horizontal ? 0 : 1;
    const dc = horizontal ? 1 : 0;
    if (this.le(l - dl, c - dc) || this.le(l + dl * letras.length, c + dc * letras.length)) return -1;
    let cruza = 0;
    for (let k = 0; k < letras.length; k++) {
      const ll = l + dl * k;
      const cc = c + dc * k;
      const tem = this.le(ll, cc);
      if (tem) {
        if (tem.letra !== letras[k] || (horizontal ? tem.h : tem.v)) return -1;
        cruza++;
      } else if (this.le(ll + dc, cc + dl) || this.le(ll - dc, cc - dl)) {
        return -1; // encostaria de lado em outra palavra
      }
    }
    if (this.postas.length && cruza === 0) return -1;
    const fimL = l + dl * (letras.length - 1);
    const fimC = c + dc * (letras.length - 1);
    const alt = Math.max(this.maxL, fimL) - Math.min(this.minL, l) + 1;
    const larg = Math.max(this.maxC, fimC) - Math.min(this.minC, c) + 1;
    if (alt > LIMITE || larg > LIMITE) return -1;
    return cruza;
  }

  poe(item: Posta['item'], l: number, c: number, horizontal: boolean): void {
    const dl = horizontal ? 0 : 1;
    const dc = horizontal ? 1 : 0;
    for (let k = 0; k < item.letras.length; k++) {
      const chave = `${l + dl * k},${c + dc * k}`;
      const tem = this.casas.get(chave) ?? { letra: item.letras[k], h: false, v: false };
      if (horizontal) tem.h = true;
      else tem.v = true;
      this.casas.set(chave, tem);
    }
    if (!this.postas.length) {
      this.minL = this.maxL = l;
      this.minC = this.maxC = c;
    }
    this.minL = Math.min(this.minL, l);
    this.minC = Math.min(this.minC, c);
    this.maxL = Math.max(this.maxL, l + dl * (item.letras.length - 1));
    this.maxC = Math.max(this.maxC, c + dc * (item.letras.length - 1));
    this.postas.push({ item, l, c, horizontal });
  }

  area(): number {
    return (this.maxL - this.minL + 1) * (this.maxC - this.minC + 1);
  }
}

function montar(itens: Posta['item'][], primeira: number, horizontal: boolean): Tabuleiro {
  const t = new Tabuleiro();
  t.poe(itens[primeira], 0, 0, horizontal);
  const faltam = itens.filter((_, i) => i !== primeira);
  let andou = true;
  while (andou && faltam.length) {
    andou = false;
    for (let i = 0; i < faltam.length; i++) {
      const item = faltam[i];
      let melhor: { l: number; c: number; h: boolean; nota: number } | undefined;
      for (const p of t.postas) {
        const h = !p.horizontal;
        for (let k = 0; k < p.item.letras.length; k++) {
          for (let j = 0; j < item.letras.length; j++) {
            if (item.letras[j] !== p.item.letras[k]) continue;
            const l = p.horizontal ? p.l - j : p.l + k;
            const c = p.horizontal ? p.c + k : p.c - j;
            const cruza = t.cabe(item.letras, l, c, h);
            if (cruza < 0) continue;
            // mais cruzamentos; depois, a grade que menos cresce e fica mais quadrada
            const dl = h ? 0 : item.letras.length - 1;
            const dc = h ? item.letras.length - 1 : 0;
            const alt = Math.max(t.maxL, l + dl) - Math.min(t.minL, l) + 1;
            const larg = Math.max(t.maxC, c + dc) - Math.min(t.minC, c) + 1;
            const nota = cruza * 1000 - alt * larg - Math.abs(alt - larg) * 3;
            if (!melhor || nota > melhor.nota) melhor = { l, c, h, nota };
          }
        }
      }
      if (melhor) {
        t.poe(item, melhor.l, melhor.c, melhor.h);
        faltam.splice(i, 1);
        i--;
        andou = true;
      }
    }
  }
  return t;
}

export function gerarCruzadinha(itensBrutos: ItemCruzadinha[]): Cruzadinha {
  const fora: Cruzadinha['fora'] = [];
  const vistas = new Set<string>();
  const itens: Posta['item'][] = [];
  for (const bruto of itensBrutos) {
    const palavra = textoSeguro(bruto.palavra).toLocaleUpperCase('pt-BR');
    const letras = soLetras(palavra);
    if (!letras) continue;
    if (letras.length < 2) fora.push({ palavra, motivo: 'curta demais' });
    else if (letras.length > LIMITE) fora.push({ palavra, motivo: `mais de ${LIMITE} letras` });
    else if (vistas.has(letras)) fora.push({ palavra, motivo: 'repetida' });
    else {
      vistas.add(letras);
      itens.push({ palavra, letras, dica: textoSeguro(bruto.dica) });
    }
  }
  if (!itens.length) return { linhas: 0, colunas: 0, grade: [], entradas: [], fora };

  // As compridas primeiro. Tenta começar por cada uma das primeiras, deitada
  // e em pé, e fica com a grade que encaixa mais palavras (depois, a menor).
  const ordem = [...itens].sort((a, b) => b.letras.length - a.letras.length);
  let melhor: Tabuleiro | undefined;
  for (let i = 0; i < Math.min(ordem.length, 6); i++) {
    for (const horizontal of [true, false]) {
      const t = montar(ordem, i, horizontal);
      if (
        !melhor ||
        t.postas.length > melhor.postas.length ||
        (t.postas.length === melhor.postas.length && t.area() < melhor.area())
      ) {
        melhor = t;
      }
    }
  }
  const t = melhor!;
  for (const item of itens) {
    if (!t.postas.some((p) => p.item === item)) fora.push({ palavra: item.palavra, motivo: 'não cruza com as outras' });
  }

  const linhas = t.maxL - t.minL + 1;
  const colunas = t.maxC - t.minC + 1;
  const grade = Array.from({ length: linhas }, () => Array<string>(colunas).fill(''));
  for (const [chave, casa] of t.casas) {
    const [l, c] = chave.split(',').map(Number);
    grade[l - t.minL][c - t.minC] = casa.letra;
  }
  // Numeração de jornal: da esquerda para a direita, de cima para baixo; a
  // casa onde começam duas palavras leva um número só.
  const inicio = [...t.postas].sort((a, b) => a.l - b.l || a.c - b.c);
  const numeros = new Map<string, number>();
  for (const p of inicio) {
    const chave = `${p.l},${p.c}`;
    if (!numeros.has(chave)) numeros.set(chave, numeros.size + 1);
  }
  const entradas = inicio
    .map((p): Entrada => ({
      numero: numeros.get(`${p.l},${p.c}`)!,
      direcao: p.horizontal ? 'horizontal' : 'vertical',
      palavra: p.item.palavra,
      letras: p.item.letras,
      dica: p.item.dica,
      linha: p.l - t.minL,
      coluna: p.c - t.minC,
    }))
    .sort((a, b) => a.numero - b.numero);
  return { linhas, colunas, grade, entradas, fora };
}

export interface OpcoesFolhaCruzadinha {
  titulo?: string;
  gabarito?: boolean;
  identidade?: Identidade;
}

/** A folha A4: grade no alto, dicas em duas colunas (deitadas e em pé). */
export function svgCruzadinhaA4(jogo: Cruzadinha, op: OpcoesFolhaCruzadinha = {}): string {
  const topo = 176;
  const fundo = 1050;
  const larguraColuna = 336;
  // As dicas mandam: primeiro se mede quanto elas ocupam; a grade fica com o resto.
  let tam = 19;
  let blocos: Array<{ titulo: string; linhas: string[][] }> = [];
  let alturaDicas = 0;
  for (; tam >= 13; tam--) {
    blocos = (['horizontal', 'vertical'] as const).map((d) => ({
      titulo: d === 'horizontal' ? 'Deitadas' : 'Em pé',
      linhas: jogo.entradas
        .filter((e) => e.direcao === d)
        .map((e) => quebrar(`${e.numero}. ${e.dica || '(sem dica)'}`, larguraColuna, tam)),
    }));
    alturaDicas = 44 + Math.max(...blocos.map((b) => b.linhas.reduce((s, l) => s + l.length * (tam + 7) + 6, 0)));
    if (alturaDicas <= (fundo - topo) * 0.5) break;
  }
  const casa = Math.min(60, 704 / Math.max(1, jogo.colunas), (fundo - topo - alturaDicas - 24) / Math.max(1, jogo.linhas));
  const x0 = 400 - (casa * jogo.colunas) / 2;

  const numeroDe = new Map(jogo.entradas.map((e) => [`${e.linha},${e.coluna}`, e.numero]));
  let corpo = '';
  for (let l = 0; l < jogo.linhas; l++) {
    for (let c = 0; c < jogo.colunas; c++) {
      if (!jogo.grade[l][c]) continue;
      const x = x0 + c * casa;
      const y = topo + l * casa;
      corpo += `<rect x="${n(x)}" y="${n(y)}" width="${n(casa)}" height="${n(casa)}" fill="#ffffff" stroke="${TINTA}" stroke-width="2.2"/>`;
      const num = numeroDe.get(`${l},${c}`);
      if (num) corpo += escrever(String(num), x + casa * 0.08, y + casa * 0.32, casa * 0.28);
      if (op.gabarito) corpo += escrever(jogo.grade[l][c], x + casa * 0.56, y + casa * 0.8, casa * 0.56, 'middle');
    }
  }

  const yDicas = topo + casa * jogo.linhas + 50;
  blocos.forEach((b, i) => {
    const x = 48 + i * (larguraColuna + 32);
    corpo += escrever(b.titulo, x, yDicas, 22);
    let y = yDicas + 36;
    for (const dica of b.linhas) {
      for (const linha of dica) {
        corpo += escrever(linha, x, y, tam);
        y += tam + 7;
      }
      y += 6;
    }
  });

  const titulo = op.titulo ?? 'Cruzadinha';
  return folha(op.gabarito ? `${titulo} — respostas` : titulo, 'Cruzadinha', corpo, {
    nome: !op.gabarito,
    identidade: op.identidade,
  });
}
