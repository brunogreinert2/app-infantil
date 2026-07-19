// Livros de alfabeto (grego e latino) GERADOS por código: uma página de
// colorir por letra, a partir de dados — 50 páginas sem desenhar 50 SVGs.
// Idealizado pelo Davi (9): "bastante coisa para pintar e aprender grego".
//
// Importante: a geração produz markdown + assets normais e passa pelo MESMO
// pipeline (carregarLivro + registro de assets). O parser continua burro;
// nenhuma regra nova foi criada.

import { carregarLivro } from '../motor/frontmatter';
import type { Livro } from '../motor/tipos';

// [maiúscula, minúscula, nome, dica de som]
type DadoLetra = [string, string, string, string];

const GREGO: DadoLetra[] = [
  ['Α', 'α', 'Alfa', 'faz o som de "a", como em amigo'],
  ['Β', 'β', 'Beta', 'faz o som de "b", como em bola'],
  ['Γ', 'γ', 'Gama', 'faz o som de "g", como em gato'],
  ['Δ', 'δ', 'Delta', 'faz o som de "d", como em dado'],
  ['Ε', 'ε', 'Épsilon', 'faz o som de "é" bem curtinho'],
  ['Ζ', 'ζ', 'Zeta', 'faz o som de "dz", como uma abelha: dzzz!'],
  ['Η', 'η', 'Eta', 'faz o som de "ê" comprido'],
  ['Θ', 'θ', 'Teta', 'faz um "t" soprado, com a língua entre os dentes'],
  ['Ι', 'ι', 'Iota', 'faz o som de "i", como em ilha'],
  ['Κ', 'κ', 'Capa', 'faz o som de "k", como em kiwi'],
  ['Λ', 'λ', 'Lambda', 'faz o som de "l", como em leão'],
  ['Μ', 'μ', 'Mi', 'faz o som de "m", como em macaco'],
  ['Ν', 'ν', 'Ni', 'faz o som de "n", como em navio'],
  ['Ξ', 'ξ', 'Csi', 'faz o som de "ks", como no fim de táxi'],
  ['Ο', 'ο', 'Ômicron', 'faz o som de "ó" bem curtinho'],
  ['Π', 'π', 'Pi', 'faz o som de "p" — é o famoso número π da matemática!'],
  ['Ρ', 'ρ', 'Rô', 'faz o som de "r" vibrado, como em caRRo de corrida'],
  ['Σ', 'σ', 'Sigma', 'faz o som de "s", como em sapo. No fim da palavra ele se veste diferente: ς'],
  ['Τ', 'τ', 'Tau', 'faz o som de "t", como em tatu'],
  ['Υ', 'υ', 'Úpsilon', 'faz o som de "u" com biquinho'],
  ['Φ', 'φ', 'Fi', 'faz o som de "f", como em foca'],
  ['Χ', 'χ', 'Qui', 'faz um "r" raspadinho lá na garganta'],
  ['Ψ', 'ψ', 'Psi', 'faz o som de "ps", como em psiu!'],
  ['Ω', 'ω', 'Ômega', 'faz o som de "ô" comprido — é a ÚLTIMA letra: do alfa ao ômega!'],
];

const LATINO: DadoLetra[] = [
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

function svgLetra(l: DadoLetra): string {
  const [mai, min, nome] = l;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect id="regiao-fundo" class="colorir-alvo" x="0" y="0" width="800" height="600" fill="#ffffff"/>
  <path id="regiao-moldura" class="colorir-alvo" fill="#ffffff" fill-rule="evenodd"
    d="M20,20 h760 v560 h-760 Z M56,56 h688 v488 h-688 Z"/>
  <text id="regiao-maiuscula" class="colorir-alvo" x="300" y="400" font-size="320"
    font-family="Georgia, 'Times New Roman', serif" font-weight="bold"
    text-anchor="middle" fill="#ffffff">${mai}</text>
  <text id="regiao-minuscula" class="colorir-alvo" x="590" y="400" font-size="210"
    font-family="Georgia, 'Times New Roman', serif" font-weight="bold"
    text-anchor="middle" fill="#ffffff">${min}</text>
  <text x="400" y="512" font-size="42" text-anchor="middle"
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
