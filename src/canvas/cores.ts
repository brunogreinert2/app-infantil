// As cores de pintar: cada uma com NOME (regra da casa, N29: nenhum estado só
// por cor) e cinco tons — muito claro, claro, a cor, escuro, muito escuro.
//
// O que fica salvo na pintura da criança é o hex (`{regioes:{id:'#hex'}}`), e
// hex publicado não muda: as 14 cores que já existiam continuam aqui com o
// mesmo valor. O NOME é só o que se mostra e se fala — pode melhorar.
//
// A ORDEM não é a do arco-íris de propósito. No arco-íris ficam lado a lado
// justamente as cores que a protanopia e a deuteranopia confundem (vermelho,
// laranja, verde, marrom). A ordem abaixo foi escolhida medindo: na grade de
// 5 colunas (celular) e na de 10 (tela larga), nenhuma cor encosta — ao lado,
// acima ou abaixo — em outra que fique parecida para algum dos três tipos de
// dicromacia. A medida e o piso estão em cores.test.ts; quem mexer na ordem
// ou acrescentar cor roda o teste.

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
}

/** colunas da grade da paleta: 5 no celular, 10 em tela larga (estilos.css) */
export const COLUNAS_PALETA = [5, 10] as const;

// [hex, nome, tem tons?]
const BASES: Array<[string, string, boolean]> = [
  ['#e63946', 'Vermelho', true],
  ['#fcbf49', 'Amarelo-sol', true],
  ['#2a9d8f', 'Verde-mar', true],
  ['#9b5de5', 'Roxo', true],
  ['#8a1538', 'Vinho', true],
  ['#c8a2e8', 'Lilás', true],
  ['#495057', 'Cinza', true],
  ['#f9e547', 'Amarelo', true],
  ['#2f9e44', 'Verde', true],
  ['#e8d5b0', 'Bege', true],
  ['#5064eb', 'Azul', true],
  ['#17bebb', 'Turquesa', true],
  ['#7a7a2a', 'Verde-oliva', true],
  ['#f06fb8', 'Rosa', true],
  ['#80b918', 'Verde-limão', true],
  ['#8d5a3a', 'Marrom', true],
  ['#f77f00', 'Laranja', true],
  ['#219ebc', 'Azul-céu', true],
  ['#ffffff', 'Branco', false],
  ['#1a1a1a', 'Preto', false],
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

export const MATIZES: Matiz[] = BASES.map(([base, nome, temTons]) => ({
  nome,
  base,
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
