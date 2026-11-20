// Caça-palavras de qualquer lista de palavras, com gabarito.
// A mesma lista (e a mesma semente) dá sempre a mesma folha.

import { TINTA, ampliada, escrever, folha, n, semear, soLetras, sorteador, textoSeguro, casa as casaPintavel } from './comum';
import type { Identidade } from '../conteudo/alfabetoArte';

/**
 * fácil: só → e ↓ · médio: mais a diagonal ↘ · difícil: as oito direções
 * (inclusive de trás para frente).
 */
export type Nivel = 'facil' | 'medio' | 'dificil';

const DIRECOES: Record<Nivel, Array<[number, number]>> = {
  facil: [[0, 1], [1, 0]],
  medio: [[0, 1], [1, 0], [1, 1]],
  dificil: [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]],
};
const OITO = DIRECOES.dificil;

/** Não podem aparecer por acaso numa folha de escola, em direção nenhuma. */
const FEIAS = ['MERDA', 'PORRA', 'PUTA', 'BUCETA', 'CARALHO', 'FODA', 'BOSTA', 'CACETE', 'VIADO'];

export interface Achado {
  /** como a professora escreveu (PÃO DE QUEIJO) */
  palavra: string;
  /** como está na grade (PAODEQUEIJO) */
  letras: string;
  linha: number;
  coluna: number;
  /** passo de uma letra para a seguinte */
  dl: number;
  dc: number;
}

export interface CacaPalavras {
  linhas: number;
  colunas: number;
  grade: string[][];
  achados: Achado[];
  /** o que ficou de fora, e por quê */
  fora: Array<{ palavra: string; motivo: string }>;
  /** cada palavra aparece uma vez só e nenhuma palavra feia se formou */
  conferido: boolean;
}

export interface PedidoCacaPalavras {
  palavras: string[];
  nivel?: Nivel;
  /** lado da grade; sem isto, o tamanho sai da lista (de 8 a 16) */
  lado?: number;
  /** mude para ter outra folha com as mesmas palavras */
  semente?: number;
}

function ocorrencias(grade: string[][], alvo: string): number {
  const L = grade.length;
  const C = grade[0].length;
  const vistos = new Set<string>();
  for (let l = 0; l < L; l++) {
    for (let c = 0; c < C; c++) {
      if (grade[l][c] !== alvo[0]) continue;
      for (const [dl, dc] of OITO) {
        const fl = l + dl * (alvo.length - 1);
        const fc = c + dc * (alvo.length - 1);
        if (fl < 0 || fl >= L || fc < 0 || fc >= C) continue;
        let k = 1;
        while (k < alvo.length && grade[l + dl * k][c + dc * k] === alvo[k]) k++;
        if (k < alvo.length) continue;
        // palíndromo (ARARA) é achado duas vezes no mesmo lugar: conta uma
        const pontas = [`${l},${c}`, `${fl},${fc}`].sort().join('|');
        vistos.add(pontas);
      }
    }
  }
  return vistos.size;
}

export function gerarCacaPalavras(pedido: PedidoCacaPalavras): CacaPalavras {
  // FOLHA AMPLIADA (2026-11-20): o que limita o tamanho da letra é a LARGURA da
  // folha dividida pelo número de colunas. Então a grade é a MENOR em que todas
  // as palavras cabem, com cada uma uma vez só (sempre a mesma: nada sorteado).
  if (ampliada() && pedido.lado === undefined) {
    const normal = gerarNoLado(pedido);
    for (let lado = 6; lado < normal.colunas; lado++) {
      const r = gerarNoLado({ ...pedido, lado });
      const perdeu = r.fora.some((f) => f.motivo.startsWith('não cabe') || f.motivo.startsWith('não achou'));
      if (!perdeu && r.conferido) return r;
    }
    return normal;
  }
  return gerarNoLado(pedido);
}

function gerarNoLado(pedido: PedidoCacaPalavras): CacaPalavras {
  const nivel = pedido.nivel ?? 'facil';
  const fora: CacaPalavras['fora'] = [];
  const vistas = new Set<string>();
  let lista: Array<{ palavra: string; letras: string }> = [];
  for (const bruta of pedido.palavras) {
    const palavra = textoSeguro(bruta).toLocaleUpperCase('pt-BR');
    const letras = soLetras(palavra);
    if (!letras) continue;
    if (letras.length < 3) fora.push({ palavra, motivo: 'curta demais: apareceria por acaso' });
    else if (vistas.has(letras)) fora.push({ palavra, motivo: 'repetida' });
    else {
      vistas.add(letras);
      lista.push({ palavra, letras });
    }
  }
  // Uma palavra dentro de outra (PARA em PARADA) teria dois lugares certos.
  lista = lista.filter((p) => {
    const invertida = [...p.letras].reverse().join('');
    const dentro = lista.find((q) => q !== p && (q.letras.includes(p.letras) || q.letras.includes(invertida)));
    if (dentro) fora.push({ palavra: p.palavra, motivo: `está dentro de ${dentro.palavra}` });
    return !dentro;
  });

  const maior = Math.max(0, ...lista.map((p) => p.letras.length));
  const total = lista.reduce((s, p) => s + p.letras.length, 0);
  const lado = Math.min(20, Math.max(6, pedido.lado ?? Math.min(16, Math.max(8, maior + 1, Math.ceil(Math.sqrt(total * 2.4))))));
  lista = lista.filter((p) => {
    if (p.letras.length <= lado) return true;
    fora.push({ palavra: p.palavra, motivo: `não cabe na grade de ${lado}` });
    return false;
  });

  const rnd = sorteador(semear(lista.map((p) => p.letras).join(',') + '|' + nivel + '|' + lado) + (pedido.semente ?? 0));
  const vazia = (): string[][] => Array.from({ length: lado }, () => Array<string>(lado).fill(''));
  const grade = vazia();
  const achados: Achado[] = [];

  // As compridas primeiro; cada uma vai para o lugar que mais cruza com as
  // outras (o embaralho só desempata).
  const ordem = [...lista].sort((a, b) => b.letras.length - a.letras.length);
  for (const p of ordem) {
    let melhor: { l: number; c: number; dl: number; dc: number; nota: number } | undefined;
    for (const [dl, dc] of DIRECOES[nivel]) {
      for (let l = 0; l < lado; l++) {
        for (let c = 0; c < lado; c++) {
          const fl = l + dl * (p.letras.length - 1);
          const fc = c + dc * (p.letras.length - 1);
          if (fl < 0 || fl >= lado || fc < 0 || fc >= lado) continue;
          let cruza = 0;
          let serve = true;
          for (let k = 0; k < p.letras.length; k++) {
            const tem = grade[l + dl * k][c + dc * k];
            if (tem === p.letras[k]) cruza++;
            else if (tem) {
              serve = false;
              break;
            }
          }
          const nota = rnd() + Math.min(cruza, 2);
          if (serve && cruza < p.letras.length && (!melhor || nota > melhor.nota)) melhor = { l, c, dl, dc, nota };
        }
      }
    }
    if (!melhor) {
      fora.push({ palavra: p.palavra, motivo: 'não achou lugar na grade' });
      continue;
    }
    for (let k = 0; k < p.letras.length; k++) grade[melhor.l + melhor.dl * k][melhor.c + melhor.dc * k] = p.letras[k];
    achados.push({ palavra: p.palavra, letras: p.letras, linha: melhor.l, coluna: melhor.c, dl: melhor.dl, dc: melhor.dc });
  }
  // a lista da folha fica na ordem em que a professora escreveu
  achados.sort((a, b) => lista.findIndex((p) => p.letras === a.letras) - lista.findIndex((p) => p.letras === b.letras));

  // Preenche o resto com letras das próprias palavras e do alfabeto, e refaz
  // enquanto alguma palavra aparecer duas vezes ou surgir palavra feia.
  const letrasPossiveis = achados.map((a) => a.letras).join('') + 'ABCDEFGHIJLMNOPQRSTUVXZ';
  let cheia = grade;
  let conferido = false;
  for (let tentativa = 0; tentativa < 60 && !conferido; tentativa++) {
    cheia = grade.map((linha) => linha.map((c) => c || letrasPossiveis[Math.floor(rnd() * letrasPossiveis.length)]));
    conferido =
      achados.every((a) => ocorrencias(cheia, a.letras) === 1) &&
      FEIAS.every((f) => vistas.has(f) || ocorrencias(cheia, f) === 0);
  }
  return { linhas: lado, colunas: lado, grade: cheia, achados, fora, conferido };
}

export interface OpcoesFolhaCaca {
  titulo?: string;
  /** desenha os contornos das respostas */
  gabarito?: boolean;
  identidade?: Identidade;
}

/** A folha A4: grade no alto, lista de palavras embaixo. */
export function svgCacaPalavrasA4(jogo: CacaPalavras, op: OpcoesFolhaCaca = {}): string {
  const topo = 176;
  // ampliada (2026-11-20): lista em duas colunas de letra 30, casas até 96
  const grande = ampliada();
  const colunasLista = grande || jogo.achados.some((a) => a.palavra.length > 12) ? 2 : 3;
  const linhasLista = Math.ceil(jogo.achados.length / colunasLista);
  const tamLista = grande ? 30 : linhasLista > 8 ? 18 : 22;
  const alturaLista = linhasLista * (tamLista + 12) + 56;
  const casa = Math.min(grande ? 96 : 58, 704 / jogo.colunas, (1050 - topo - alturaLista) / jogo.linhas);
  const x0 = 400 - (casa * jogo.colunas) / 2;
  const centro = (l: number, c: number) => ({ x: x0 + casa * (c + 0.5), y: topo + casa * (l + 0.5) });

  let corpo = `<rect x="${n(x0)}" y="${topo}" width="${n(casa * jogo.colunas)}" height="${n(casa * jogo.linhas)}" rx="10" fill="none" stroke="${TINTA}" stroke-width="3"/>`;
  const tamLetra = casa * 0.62;
  // casas para pintar: achou a palavra, pinta as letras dela
  for (let l = 0; l < jogo.linhas; l++) {
    for (let c = 0; c < jogo.colunas; c++) corpo += casaPintavel(x0 + c * casa, topo + l * casa, casa, casa);
  }
  for (let l = 0; l < jogo.linhas; l++) {
    for (let c = 0; c < jogo.colunas; c++) {
      const p = centro(l, c);
      corpo += escrever(jogo.grade[l][c], p.x, p.y + tamLetra * 0.36, tamLetra, 'middle');
    }
  }
  if (op.gabarito) {
    for (const a of jogo.achados) {
      const i = centro(a.linha, a.coluna);
      const f = centro(a.linha + a.dl * (a.letras.length - 1), a.coluna + a.dc * (a.letras.length - 1));
      const comprimento = Math.hypot(f.x - i.x, f.y - i.y) + casa * 0.8;
      const angulo = (Math.atan2(f.y - i.y, f.x - i.x) * 180) / Math.PI;
      const h = casa * 0.78;
      corpo += `<rect x="${n(-casa * 0.4)}" y="${n(-h / 2)}" width="${n(comprimento)}" height="${n(h)}" rx="${n(h / 2)}" fill="none" stroke="${TINTA}" stroke-width="2.5" transform="translate(${n(i.x)} ${n(i.y)}) rotate(${n(angulo)})"/>`;
    }
  }

  const yLista = topo + casa * jogo.linhas + 52;
  const larguraColuna = 704 / colunasLista;
  jogo.achados.forEach((a, k) => {
    const col = Math.floor(k / linhasLista);
    const lin = k % linhasLista;
    const x = 48 + col * larguraColuna;
    const y = yLista + lin * (tamLista + 12);
    corpo += `<rect x="${n(x)}" y="${n(y - tamLista * 0.78)}" width="${n(tamLista * 0.8)}" height="${n(tamLista * 0.8)}" rx="3" fill="none" stroke="${TINTA}" stroke-width="1.6"/>`;
    corpo += escrever(a.palavra, x + tamLista * 1.25, y, tamLista, 'start', larguraColuna - tamLista * 1.6);
  });

  const titulo = op.titulo ?? 'Caça-palavras';
  return folha(op.gabarito ? `${titulo} — respostas` : titulo, 'Caça-palavras', corpo, {
    nome: !op.gabarito,
    identidade: op.identidade,
  });
}
