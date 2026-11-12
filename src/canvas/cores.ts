// As cores de pintar: cada uma com NOME (regra da casa, N29: nenhum estado só
// por cor) e cinco tons — muito claro, claro, a cor, escuro, muito escuro.
//
// O que fica salvo na pintura da criança é o hex (`{regioes:{id:'#hex'}}`), e
// hex publicado não muda: as 14 cores que já existiam continuam aqui com o
// mesmo valor. O NOME é só o que se mostra e se fala — pode melhorar.
//
// A ORDEM é um XADREZ, e não o arco-íris, de propósito.
//
// Quem tem daltonismo vermelho-verde (protanopia, deuteranopia e as formas
// brandas, como a protanomalia do Bruno) perde a diferença entre vermelho,
// laranja, amarelo, verde e marrom — mas continua vendo bem a diferença entre
// o lado "amarelado" e o lado "azulado" das cores, e entre claro e escuro.
// Então cada cor tem um LADO: quente (a família que se confunde entre si) ou
// frio (azuis, roxos, rosa, turquesa, cinza, branco, preto). Na grade de 5
// colunas, quente e frio se alternam como casas de xadrez: toda cor quente
// tem cores frias em cima, embaixo e dos dois lados, nunca outra quente.
// Dentro do xadrez, a posição de cada cor foi escolhida medindo (simulação
// em visaoDeCores.ts) para afastar ao máximo as parecidas, inclusive na
// diagonal. Não faz sentido de arco-íris, e não precisa: o nome está escrito.
//
// A primeira ordem (2026-11-11) só media "diferença de cor" entre vizinhas e
// deixava Vermelho ao lado de Amarelo-sol e Verde perto de Amarelo — o Bruno
// olhou e continuou vendo cores parecidas encostadas. O número passava; o
// olho, não. Daí o xadrez (2026-11-12).
//
// A medida e os pisos estão em cores.test.ts; quem mexer na ordem, nas cores
// ou nas colunas da grade roda o teste.

export type Lado = 'quente' | 'frio';

export interface Tom {
  cor: string;
  nome: string;
}

export interface Matiz {
  nome: string;
  /** o tom do meio: a cor que aparece na paleta */
  base: string;
  /** do mais claro ao mais escuro; branco e preto têm um só */
  tons: Tom[];
  /** de que lado do xadrez a cor fica (ver o comentário lá em cima) */
  lado: Lado;
}

/** colunas da grade da paleta, em toda tela (estilos.css). O xadrez só fecha com número ímpar. */
export const COLUNAS_PALETA = 5;

// [hex, nome, tem tons?, lado] — uma linha em branco a cada fileira da grade
const BASES: Array<[string, string, boolean, Lado]> = [
  ['#8d5a3a', 'Marrom', true, 'quente'],
  ['#219ebc', 'Azul-céu', true, 'frio'],
  ['#e8d5b0', 'Bege', true, 'quente'],
  ['#f06fb8', 'Rosa', true, 'frio'],
  ['#80b918', 'Verde-limão', true, 'quente'],

  ['#ffffff', 'Branco', false, 'frio'],
  ['#f77f00', 'Laranja', true, 'quente'],
  ['#495057', 'Cinza', true, 'frio'],
  ['#2f9e44', 'Verde', true, 'quente'],
  ['#9b5de5', 'Roxo', true, 'frio'],

  ['#e63946', 'Vermelho', true, 'quente'],
  ['#5064eb', 'Azul', true, 'frio'],
  ['#f9e547', 'Amarelo', true, 'quente'],
  ['#1a1a1a', 'Preto', false, 'frio'],
  ['#fcbf49', 'Amarelo-sol', true, 'quente'],

  ['#c8a2e8', 'Lilás', true, 'frio'],
  ['#8a1538', 'Vinho', true, 'quente'],
  ['#17bebb', 'Turquesa', true, 'frio'],
  ['#7a7a2a', 'Verde-oliva', true, 'quente'],
  ['#2a9d8f', 'Verde-mar', true, 'frio'],
];

// quanto de branco (claros) ou de preto (escuros) entra em cada tom
const RECEITA: Array<[sufixo: string, com: string, peso: number]> = [
  [' muito claro', '#ffffff', 0.62],
  [' claro', '#ffffff', 0.34],
  ['', '#000000', 0],
  [' escuro', '#000000', 0.32],
  [' muito escuro', '#000000', 0.6],
];

function canais(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function misturar(hexA: string, hexB: string, pesoB: number): string {
  const a = canais(hexA);
  const b = canais(hexB);
  return (
    '#' +
    a
      .map((v, i) => Math.round(v * (1 - pesoB) + b[i] * pesoB))
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

export const MATIZES: Matiz[] = BASES.map(([base, nome, temTons, lado]) => ({
  nome,
  base,
  lado,
  tons: temTons
    ? RECEITA.map(([sufixo, com, peso]) => ({
        cor: peso === 0 ? base : misturar(base, com, peso),
        nome: nome + sufixo,
      }))
    : [{ cor: base, nome }],
}));

const TODAS: Tom[] = MATIZES.flatMap((m) => m.tons);
const POR_HEX = new Map(TODAS.map((t) => [t.cor, t.nome]));

/** O matiz a que uma cor pertence (para marcar o poço e abrir os tons certos). */
export function matizDe(hex: string): Matiz | undefined {
  const cor = hex.toLowerCase();
  return MATIZES.find((m) => m.tons.some((t) => t.cor === cor));
}

/**
 * O nome de uma cor. Cor da tabela: o nome exato. Qualquer outro hex (uma
 * pintura antiga, se um dia a receita dos tons mudar): o nome da cor mais
 * próxima — nunca fica sem nome.
 */
export function nomeDaCor(hex: string): string {
  const cor = hex.toLowerCase();
  const exato = POR_HEX.get(cor);
  if (exato) return exato;
  if (!/^#[0-9a-f]{6}$/.test(cor)) return '';
  const alvo = canais(cor);
  let melhor = TODAS[0];
  let menor = Infinity;
  for (const t of TODAS) {
    const c = canais(t.cor);
    const d = (c[0] - alvo[0]) ** 2 + (c[1] - alvo[1]) ** 2 + (c[2] - alvo[2]) ** 2;
    if (d < menor) {
      menor = d;
      melhor = t;
    }
  }
  return melhor.nome;
}

/** Preto ou branco: o que se lê melhor em cima desta cor (para a marca ✓). */
export function tintaSobre(hex: string): string {
  const [r, g, b] = canais(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // o ponto em que preto e branco empatam (contraste 4,58 com os dois)
  return l > 0.179 ? '#000000' : '#ffffff';
}
