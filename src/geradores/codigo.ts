// O CÓDIGO DA FOLHA (ideia do Bruno, 2026-11-18): cada folha tem um código que,
// digitado no app, monta EXATAMENTE a mesma folha — os mesmos números, as mesmas
// palavras, a mesma letra — e com ela as respostas.
//
// Funciona porque nada aqui é sorteado: a mesma escolha dá sempre a mesma folha.
// Então o código carrega a própria ESCOLHA (o pedido do formulário), compacta,
// e não precisa de servidor nem de internet.
//
//   H1-K3A0-7TQM-…
//   │  └─ o pedido: só o que difere do pedido de partida, em base 32
//   └─ a versão do código
//
// Regras que não se quebram (são o que faz um código antigo continuar valendo):
//  - TIPOS_NO_CODIGO e CAMPOS_NO_CODIGO só CRESCEM no fim; nada se remove nem
//    muda de lugar (o número de cada um está nos códigos já impressos);
//  - o pedido de partida é o de uma data fixa (DATA_DE_REFERENCIA), não o de hoje;
//  - se um gerador mudar a folha que um código monta, o teste das folhas de
//    referência reprova: ou se conserta o gerador, ou se sobe a versão do código.
//
// Base 32 de Crockford: sem I, L, O, U, para ninguém confundir 1 com I nem 0
// com O ao digitar; maiúscula ou minúscula, tanto faz; um caractere de
// conferência no fim pega erro de digitação.

import { ehDoProfessor, pedidoInicial, type Pedido, type TipoDeFolha } from './pedido';
import { comHalo, comLetra, escrever, type Letra } from './comum';

export const VERSAO_DO_CODIGO = 'H1';

/** A ordem é o número no código. SÓ ACRESCENTAR NO FIM. */
export const TIPOS_NO_CODIGO: TipoDeFolha[] = [
  'caca', 'cruzadinha', 'jogo', 'matematica', 'pauta', 'grade', 'reguas', 'plano', 'calendario',
  'silabas', 'logica', 'contas', 'recortar', 'motora', 'cartoes', 'rotina', 'sequencia', 'capa',
];

/** A ordem é o número no código. SÓ ACRESCENTAR NO FIM. */
export const CAMPOS_NO_CODIGO: string[] = [
  'titulo', 'palavras', 'nivel', 'semente', 'respostas', 'modelo', 'ano', 'mes', 'feriados', 'ornamento',
  'alto', 'subtitulo', 'nome', 'rodape', 'itens', 'operacao', 'algarismos', 'reagrupar', 'quantas', 'numero',
  'completar', 'margem', 'jogo', 'pecas', 'cartelas', 'lado', 'verso', 'ordens', 'alcance', 'curva',
  'a', 'b', 'c', 'quadros', 'linhas', 'nomes', 'linha2', 'horas', 'de', 'ate',
  'passos', 'maiusculas', 'hora', 'livro', 'partes', 'familias', 'proprias', 'estilos', 'materia', 'aspecto',
  'zoom', 'posX', 'posY', 'pronta', 'ampliada',
];

const LETRAS_NO_CODIGO: Letra[] = ['atkinson', 'cardo', 'opendyslexic'];

/** Campos que nunca entram no código: a figura do calendário (grande demais). */
const FORA_DO_CODIGO = new Set(['imagem']);

/** O pedido de partida é o desta data, para o código não mudar com o calendário. */
export const DATA_DE_REFERENCIA = new Date(2026, 0, 1);

const ALFABETO = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function paraBase32(bytes: Uint8Array): string {
  let bits = 0;
  let valor = 0;
  let saida = '';
  for (const b of bytes) {
    valor = (valor << 8) | b;
    bits += 8;
    while (bits >= 5) {
      saida += ALFABETO[(valor >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) saida += ALFABETO[(valor << (5 - bits)) & 31];
  return saida;
}

function deBase32(texto: string): Uint8Array | undefined {
  let bits = 0;
  let valor = 0;
  const saida: number[] = [];
  for (const c of texto) {
    const i = ALFABETO.indexOf(c);
    if (i < 0) return undefined;
    valor = (valor << 5) | i;
    bits += 5;
    if (bits >= 8) {
      saida.push((valor >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(saida);
}

/** Um caractere de conferência: pega troca de letra e letra a mais ou a menos. */
function conferencia(corpo: string): string {
  let soma = 0;
  for (let i = 0; i < corpo.length; i++) soma = (soma * 7 + ALFABETO.indexOf(corpo[i]) * (i + 3)) % 32;
  return ALFABETO[soma];
}

/** Lê o que a pessoa digitou: minúscula, espaço, traço, e I/L/O confundidos. */
function normalizar(texto: string): string {
  return texto
    .toUpperCase()
    .replace(/[\s\-–—_.]/g, '')
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0');
}

const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// O pedido em texto curto, antes da base 32 (JSON gastaria aspas e colchetes):
//   tipo~letra~campo=valor~campo=valor
// valor: número como está; T e F para sim e não; 'texto (sem ~); e, para o
// raro objeto ou texto com ~, JSON começando por { [ ou ".
function valorParaTexto(v: unknown): string {
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'T' : 'F';
  if (typeof v === 'string' && !v.includes('~')) return `'${v}`;
  return JSON.stringify(v);
}

function textoParaValor(t: string): unknown {
  if (t === 'T') return true;
  if (t === 'F') return false;
  if (t.startsWith("'")) return t.slice(1);
  if (/^[{["]/.test(t)) return JSON.parse(t);
  const n = Number(t);
  if (t === '' || !Number.isFinite(n)) throw new Error('valor');
  return n;
}

export type ResultadoCodigo = { codigo: string } | { erro: string };

/**
 * O código da folha. Não há código para folha com nome de aluno (crachás,
 * etiquetas, marcadores): o nome iria dentro dele, impresso no papel.
 */
export function codificar(pedido: Pedido, letra: Letra = 'atkinson'): ResultadoCodigo {
  const t = TIPOS_NO_CODIGO.indexOf(pedido.tipo);
  if (t < 0) return { erro: 'Esta folha ainda não tem código.' };
  if (pedido.tipo === 'cartoes' && pedido.modelo !== 'hq' && pedido.nomes.trim()) {
    return { erro: 'Folha com nomes de alunos não leva código: o nome iria junto.' };
  }
  const base = pedidoInicial(pedido.tipo, DATA_DE_REFERENCIA) as unknown as Record<string, unknown>;
  const diferencas: Array<[number, unknown]> = [];
  for (const [campo, valor] of Object.entries(pedido)) {
    if (campo === 'tipo' || FORA_DO_CODIGO.has(campo) || valor === undefined) continue;
    if (igual(valor, base[campo])) continue;
    const c = CAMPOS_NO_CODIGO.indexOf(campo);
    if (c < 0) return { erro: `O campo "${campo}" ainda não tem lugar no código.` };
    diferencas.push([c, valor]);
  }
  const l = Math.max(0, LETRAS_NO_CODIGO.indexOf(letra));
  const texto = [t, l, ...diferencas.map(([c, v]) => `${c}=${valorParaTexto(v)}`)].join('~');
  const corpo = paraBase32(new TextEncoder().encode(texto));
  const comConferencia = corpo + conferencia(corpo);
  const grupos = comConferencia.match(/.{1,4}/g) ?? [];
  return { codigo: `${VERSAO_DO_CODIGO}-${grupos.join('-')}` };
}

export type Decodificado = { pedido: Pedido; letra: Letra; avisos: string[] } | { erro: string };

export function decodificar(digitado: string): Decodificado {
  const texto = normalizar(digitado);
  if (!texto) return { erro: 'Digite o código que está na folha.' };
  if (!texto.startsWith(VERSAO_DO_CODIGO)) {
    return /^H\d/.test(texto)
      ? { erro: 'Este código é de outra versão do app. Atualize o app para montar esta folha.' }
      : { erro: 'Isto não parece um código de folha (ele começa com H1).' };
  }
  const resto = texto.slice(VERSAO_DO_CODIGO.length);
  const corpo = resto.slice(0, -1);
  if (!corpo || conferencia(corpo) !== resto.slice(-1)) {
    return { erro: 'O código não confere: alguma letra ou número foi digitado diferente. Confira com a folha.' };
  }
  const bytes = deBase32(corpo);
  if (!bytes) return { erro: 'O código tem um caractere que não existe nos códigos de folha.' };
  let diferencas: Array<[number, unknown]>;
  let t: number;
  let l: number;
  try {
    // a base 32 pode deixar um byte zero de enchimento no fim: fora
    const texto = new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/\u0000+$/u, '');
    const [tt, ll, ...pares] = texto.split('~');
    t = Number(tt);
    l = Number(ll);
    if (!Number.isInteger(t) || !Number.isInteger(l)) throw new Error('cabeça');
    diferencas = pares.map((par): [number, unknown] => {
      const corte = par.indexOf('=');
      if (corte < 1) throw new Error('par');
      return [Number(par.slice(0, corte)), textoParaValor(par.slice(corte + 1))];
    });
  } catch {
    return { erro: 'O código não confere. Confira com a folha.' };
  }
  const tipo = TIPOS_NO_CODIGO[t];
  if (!tipo) return { erro: 'Esta folha é de uma versão mais nova do app.' };
  const pedido = pedidoInicial(tipo, DATA_DE_REFERENCIA) as unknown as Record<string, unknown>;
  const avisos: string[] = [];
  for (const par of diferencas) {
    const campo = CAMPOS_NO_CODIGO[par[0]];
    if (!campo) {
      avisos.push('Uma escolha desta folha não existe nesta versão do app e ficou de fora.');
      continue;
    }
    pedido[campo] = par[1];
  }
  return { pedido: pedido as unknown as Pedido, letra: LETRAS_NO_CODIGO[l] ?? 'atkinson', avisos };
}

/**
 * O código impresso no pé da folha, pequeno, no canto direito, com um
 * contorno branco por trás (algumas folhas têm grade até a borda). Sempre na
 * Atkinson: o zero dela tem risco, e num código é isso que se quer — ninguém
 * confunde 0 com O.
 */
export function carimbar(svg: string, codigo: string): string {
  const fim = svg.lastIndexOf('</svg>');
  if (fim < 0) return svg;
  const pe = comLetra('atkinson', () => comHalo(escrever(`Código desta folha: ${codigo}`, 790, 1124, 13, 'end'), 120));
  return svg.slice(0, fim) + pe + svg.slice(fim);
}

/**
 * Onde o código vai: na folha do professor (a de respostas) e, quando o tipo
 * não tem respostas, em todas. Na do aluno, não — o código monta também as
 * respostas, e não pode virar atalho para elas.
 */
export function folhasComCodigo<F extends { titulo: string; svg: string }>(folhas: F[], codigo: string): F[] {
  const temRespostas = folhas.some(ehDoProfessor);
  return folhas.map((f) => (!temRespostas || ehDoProfessor(f) ? { ...f, svg: carimbar(f.svg, codigo) } : f));
}
