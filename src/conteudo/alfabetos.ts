// Livros de alfabeto (grego e latino) GERADOS por código: uma página de
// colorir por letra, a partir de dados — 50 páginas sem desenhar 50 SVGs.
// Idealizado pelo Davi (9): "bastante coisa para pintar e aprender grego".
//
// Importante: a geração produz markdown + assets normais e passa pelo MESMO
// pipeline (carregarLivro + registro de assets). O parser continua burro;
// nenhuma regra nova foi criada.

import { carregarLivro } from '../motor/frontmatter';
import type { Livro } from '../motor/tipos';
import glifos from './glifos.json';

const GLIFOS = glifos as Record<string, { d: string; adv: number }>;

// [maiúscula, minúscula, nome, dica de som, nome secundário p/ tabela impressa]
// No grego, o 5º campo é o nome da letra escrito EM GREGO (Αλφα, Βητα...).
export type DadoLetra = [string, string, string, string, string?];

export const GREGO: DadoLetra[] = [
  ['Α', 'α', 'Alfa', 'faz o som de "a", como em amigo', 'Αλφα'],
  ['Β', 'β', 'Beta', 'faz o som de "b", como em bola', 'Βητα'],
  ['Γ', 'γ', 'Gama', 'faz o som de "g", como em gato', 'Γαμμα'],
  ['Δ', 'δ', 'Delta', 'faz o som de "d", como em dado', 'Δελτα'],
  ['Ε', 'ε', 'Épsilon', 'faz o som de "é" bem curtinho', 'Εψιλον'],
  ['Ζ', 'ζ', 'Zeta', 'faz o som de "dz", como uma abelha: dzzz!', 'Ζητα'],
  ['Η', 'η', 'Eta', 'faz o som de "ê" comprido', 'Ητα'],
  ['Θ', 'θ', 'Teta', 'faz um "t" soprado, com a língua entre os dentes', 'Θητα'],
  ['Ι', 'ι', 'Iota', 'faz o som de "i", como em ilha', 'Ιωτα'],
  ['Κ', 'κ', 'Capa', 'faz o som de "k", como em kiwi', 'Καππα'],
  ['Λ', 'λ', 'Lambda', 'faz o som de "l", como em leão', 'Λαμβδα'],
  ['Μ', 'μ', 'Mi', 'faz o som de "m", como em macaco', 'Μυ'],
  ['Ν', 'ν', 'Ni', 'faz o som de "n", como em navio', 'Νυ'],
  ['Ξ', 'ξ', 'Csi', 'faz o som de "ks", como no fim de táxi', 'Ξι'],
  ['Ο', 'ο', 'Ômicron', 'faz o som de "ó" bem curtinho', 'Ομικρον'],
  ['Π', 'π', 'Pi', 'faz o som de "p" — é o famoso número π da matemática!', 'Πι'],
  ['Ρ', 'ρ', 'Rô', 'faz o som de "r" vibrado, como em caRRo de corrida', 'Ρω'],
  ['Σ', 'σ', 'Sigma', 'faz o som de "s", como em sapo. No fim da palavra ele se veste diferente: ς', 'Σιγμα'],
  ['Τ', 'τ', 'Tau', 'faz o som de "t", como em tatu', 'Ταυ'],
  ['Υ', 'υ', 'Úpsilon', 'faz o som de "u" com biquinho', 'Υψιλον'],
  ['Φ', 'φ', 'Fi', 'faz o som de "f", como em foca', 'Φι'],
  ['Χ', 'χ', 'Qui', 'faz um "r" raspadinho lá na garganta', 'Χι'],
  ['Ψ', 'ψ', 'Psi', 'faz o som de "ps", como em psiu!', 'Ψι'],
  ['Ω', 'ω', 'Ômega', 'faz o som de "ô" comprido — é a ÚLTIMA letra: do alfa ao ômega!', 'Ωμεγα'],
];

export const LATINO: DadoLetra[] = [
  ['A', 'a', 'A', 'de abelha'],
  ['B', 'b', 'B', 'de bola'],
  ['C', 'c', 'C', 'de casa'],
  ['D', 'd', 'D', 'de dado'],
  ['E', 'e', 'E', 'de elefante'],
  ['F', 'f', 'F', 'de foca'],
  ['G', 'g', 'G', 'de gato'],
  ['H', 'h', 'H', 'de hipopótamo'],
  ['I', 'i', 'I', 'de ilha'],
  ['J', 'j', 'J', 'de jacaré'],
  ['K', 'k', 'K', 'de kiwi'],
  ['L', 'l', 'L', 'de leão'],
  ['M', 'm', 'M', 'de macaco'],
  ['N', 'n', 'N', 'de navio'],
  ['O', 'o', 'O', 'de ovo'],
  ['P', 'p', 'P', 'de pato'],
  ['Q', 'q', 'Q', 'de queijo'],
  ['R', 'r', 'R', 'de rato'],
  ['S', 's', 'S', 'de sapo'],
  ['T', 't', 'T', 'de tatu'],
  ['U', 'u', 'U', 'de uva'],
  ['V', 'v', 'V', 'de vaca'],
  ['W', 'w', 'W', 'de waffle'],
  ['X', 'x', 'X', 'de xícara'],
  ['Y', 'y', 'Y', 'de yoga'],
  ['Z', 'z', 'Z', 'de zebra'],
];

// Letra como CAMINHO vetorial (glifos.json, gerado por scripts/gera-glifos.mjs):
// os furos do A e do O são furos de verdade, então o clique no vão atravessa
// para o azulejo de trás — com <text> isso é impossível (a caixa retangular
// do caractere engole o clique). Bônus: letra idêntica em qualquer aparelho.
function caminhoLetra(id: string, letra: string, centroX: number, tamanho: number): string {
  const g = GLIFOS[letra];
  if (!g) return '';
  const escala = tamanho / 1000;
  const tx = centroX - (g.adv * escala) / 2;
  return `<path id="${id}" class="colorir-alvo" fill="#ffffff" d="${g.d}"
    transform="translate(${tx.toFixed(1)},400) scale(${escala})"/>`;
}

function svgLetra(l: DadoLetra): string {
  const [mai, min, nome] = l;
  // Os "azulejos" (quadro-*) atrás de cada letra existem para que o vão
  // interno de letras como A e O seja clicável SEM pintar o fundo inteiro
  // (feedback de teste real: clicar no buraco do O mudava o fundo todo).
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect id="regiao-fundo" class="colorir-alvo" x="0" y="0" width="800" height="600" fill="#ffffff"/>
  <path id="regiao-moldura" class="colorir-alvo" fill="#ffffff" fill-rule="evenodd"
    d="M20,20 h760 v560 h-760 Z M56,56 h688 v488 h-688 Z"/>
  <rect id="regiao-quadro-maiuscula" class="colorir-alvo" x="105" y="110" width="385" height="360" rx="26" fill="#ffffff"/>
  <rect id="regiao-quadro-minuscula" class="colorir-alvo" x="505" y="155" width="215" height="315" rx="26" fill="#ffffff"/>
  ${caminhoLetra('regiao-maiuscula', mai, 300, 320)}
  ${caminhoLetra('regiao-minuscula', min, 612, 210)}
  <text x="400" y="530" font-size="42" text-anchor="middle"
    font-family="'Segoe UI', sans-serif" fill="#1a1a1a">${nome}</text>
</svg>`;
}

interface LivroGerado {
  livro: Livro;
  arquivos: Record<string, string>;
}

function gerarLivroAlfabeto(
  id: string,
  titulo: string,
  intro: string,
  letras: DadoLetra[],
  faixa: string,
  quizYaml: string,
): LivroGerado {
  const arquivos: Record<string, string> = {};
  const linhasAssets: string[] = [];
  const corpo: string[] = [`# ${titulo}`, '', intro, ''];

  letras.forEach((l, i) => {
    const [mai, min, nome, dica] = l;
    const assetId = `letra${String(i + 1).padStart(2, '0')}`;
    const arquivo = `${id}_${assetId}.svg`;
    arquivos[arquivo] = svgLetra(l);
    linhasAssets.push(
      `  - id: "${assetId}"`,
      `    tipo: "colorir"`,
      `    arquivo_interativo: "${arquivo}"`,
    );
    corpo.push(`## ${mai} ${min} — ${nome}`, '', `${nome} ${dica}.`, '', `{{img:${assetId}}}`, '');
  });

  const md = [
    '---',
    `titulo: "${titulo}"`,
    `faixa_etaria: "${faixa}"`,
    'nivel_leitura: "iniciante"',
    'licenca: "CC0"',
    'tema_padrao: "arco-iris"',
    'assets:',
    ...linhasAssets,
    quizYaml,
    '---',
    '',
    ...corpo,
  ].join('\n');

  return { livro: carregarLivro(id, md), arquivos };
}

export function gerarAlfabetos(): LivroGerado[] {
  return [
    gerarLivroAlfabeto(
      'alfabeto-grego',
      'O Alfabeto Grego',
      'O alfabeto grego tem 24 letras e existe há quase três mil anos. Pinte cada letra e aprenda o nome dela!',
      GREGO,
      '8-12',
      [
        'quiz:',
        '  - pergunta: "Qual é a ÚLTIMA letra do alfabeto grego?"',
        '    alternativas:',
        '      - "Alfa"',
        '      - "Ômega"',
        '      - "Beta"',
        '    correta: 1',
        '    nivel: "capitulo"',
        '    explicacao: "Ômega (Ω) é a última! Por isso dizemos \'do alfa ao ômega\' — do começo ao fim."',
      ].join('\n'),
    ),
    gerarLivroAlfabeto(
      'alfabeto',
      'O Alfabeto',
      'Nosso alfabeto tem 26 letras. Pinte cada uma e descubra uma palavra que começa com ela!',
      LATINO,
      '5-8',
      [
        'quiz:',
        '  - pergunta: "Quantas letras tem o nosso alfabeto?"',
        '    alternativas:',
        '      - "26"',
        '      - "20"',
        '      - "30"',
        '    correta: 0',
        '    nivel: "capitulo"',
        '    explicacao: "São 26 letras, de A até Z!"',
      ].join('\n'),
    ),
  ];
}
