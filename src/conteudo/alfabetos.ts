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
function glifo(letra: string, centroX: number, linhaBase: number, tamanho: number): string {
  const g = GLIFOS[letra];
  if (!g) return '';
  const escala = tamanho / 1000;
  const tx = centroX - (g.adv * escala) / 2;
  return `<path d="${g.d}" transform="translate(${tx.toFixed(1)},${linhaBase}) scale(${escala.toFixed(4)})"/>`;
}

// Grupo <g> como região de pintura: o clique num filho sobe até o grupo
// (closest('.colorir-alvo') na camadaBase) e o fill aplicado ao grupo
// é herdado pelos caminhos internos.
function regiao(id: string, conteudo: string): string {
  return `<g id="${id}" class="colorir-alvo" fill="#ffffff">${conteudo}</g>`;
}

function caminhoLetra(id: string, letra: string, centroX: number, tamanho: number): string {
  return regiao(id, glifo(letra, centroX, 400, tamanho));
}

function legenda(x: number, y: number, texto: string, tamanho = 24): string {
  return `<text x="${x}" y="${y}" font-size="${tamanho}" text-anchor="middle"
    font-family="'Segoe UI', sans-serif" fill="#1a1a1a">${texto}</text>`;
}

// ---------- pôsteres pintáveis (todas as letras num arquivo só) ----------

function svgTabelaAlfabeto(titulo: string, letras: DadoLetra[]): string {
  const colunas = 4;
  const larguraCel = 200;
  const alturaCel = 170;
  const topo = 70;
  const linhas = Math.ceil(letras.length / colunas);
  const L = colunas * larguraCel;
  const A = topo + linhas * alturaCel + 16;

  let corpo = '';
  letras.forEach((l, i) => {
    const x0 = (i % colunas) * larguraCel;
    const y0 = topo + Math.floor(i / colunas) * alturaCel;
    corpo += `<rect id="regiao-quadro-${i + 1}" class="colorir-alvo" x="${x0 + 6}" y="${y0 + 6}"
      width="${larguraCel - 12}" height="${alturaCel - 12}" rx="12" fill="#ffffff"/>`;
    corpo += regiao(
      `regiao-letra-${i + 1}`,
      glifo(l[0], x0 + 72, y0 + 108, 92) + glifo(l[1], x0 + 142, y0 + 108, 66),
    );
    corpo += legenda(x0 + 100, y0 + 144, l[2], 22);
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${A}">
  <rect id="regiao-fundo" class="colorir-alvo" x="0" y="0" width="${L}" height="${A}" fill="#ffffff"/>
  ${legenda(L / 2, 46, titulo, 40)}
  ${corpo}
</svg>`;
}

interface CaixaPoster {
  simbolos: string; // letras desenhadas como glifos, ex: "αι"
  rotulo: string;
}

function fileiraCaixas(
  caixas: CaixaPoster[],
  y0: number,
  idBase: number,
  largura = 180,
): string {
  const vao = 15;
  const total = caixas.length * largura + (caixas.length - 1) * vao;
  const x0 = (800 - total) / 2;
  let corpo = '';
  caixas.forEach((c, i) => {
    const x = x0 + i * (largura + vao);
    const cx = x + largura / 2;
    const n = idBase + i;
    corpo += `<rect id="regiao-quadro-${n}" class="colorir-alvo" x="${x}" y="${y0}"
      width="${largura}" height="180" rx="14" fill="#ffffff"/>`;
    const letras = [...c.simbolos];
    const tamanho = letras.length > 1 ? 95 : 115;
    const passo = 64;
    const inicioX = cx - ((letras.length - 1) * passo) / 2;
    corpo += regiao(
      `regiao-letra-${n}`,
      letras.map((s, j) => glifo(s, inicioX + j * passo, y0 + 118, tamanho)).join(''),
    );
    corpo += legenda(cx, y0 + 165, c.rotulo, 19);
  });
  return corpo;
}

function svgVogaisGrego(): string {
  const corpo = [
    legenda(400, 48, 'Vogais e Ditongos Gregos', 40),
    legenda(400, 102, 'As Breves e As Longas', 28),
    fileiraCaixas(
      [
        { simbolos: 'ε', rotulo: 'Épsilon — breve' },
        { simbolos: 'ο', rotulo: 'Ômicron — breve' },
        { simbolos: 'η', rotulo: 'Eta — longa' },
        { simbolos: 'ω', rotulo: 'Ômega — longa' },
      ],
      122,
      1,
    ),
    legenda(400, 360, 'As Ambivalentes (breves ou longas)', 28),
    fileiraCaixas(
      [
        { simbolos: 'α', rotulo: 'Alfa' },
        { simbolos: 'ι', rotulo: 'Iota' },
        { simbolos: 'υ', rotulo: 'Ípsilon' },
      ],
      380,
      5,
    ),
    legenda(400, 618, 'Os Ditongos', 28),
    fileiraCaixas(
      [
        { simbolos: 'αι', rotulo: 'α + ι (αιθερ)' },
        { simbolos: 'ει', rotulo: 'ε + ι (εις)' },
        { simbolos: 'οι', rotulo: 'ο + ι (οινος)' },
      ],
      638,
      8,
    ),
    fileiraCaixas(
      [
        { simbolos: 'αυ', rotulo: 'α + υ (αυτος)' },
        { simbolos: 'ευ', rotulo: 'ε + υ (ευ)' },
        { simbolos: 'ου', rotulo: 'ο + υ (ου)' },
      ],
      838,
      11,
    ),
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1040">
  <rect id="regiao-fundo" class="colorir-alvo" x="0" y="0" width="800" height="1040" fill="#ffffff"/>
  ${corpo}
</svg>`;
}

function svgVogaisLatino(): string {
  const corpo = [
    legenda(400, 48, 'Vogais e Encontros', 40),
    legenda(400, 102, 'As Vogais', 28),
    fileiraCaixas(
      [
        { simbolos: 'Aa', rotulo: 'abelha' },
        { simbolos: 'Ee', rotulo: 'elefante' },
        { simbolos: 'Ii', rotulo: 'ilha' },
      ],
      122,
      1,
    ),
    fileiraCaixas(
      [
        { simbolos: 'Oo', rotulo: 'ovo' },
        { simbolos: 'Uu', rotulo: 'uva' },
      ],
      322,
      4,
    ),
    legenda(400, 560, 'Encontros de letras (duas letras, um som)', 28),
    fileiraCaixas(
      [
        { simbolos: 'ch', rotulo: 'chave, chuva' },
        { simbolos: 'lh', rotulo: 'palhaço, ilha' },
        { simbolos: 'nh', rotulo: 'ninho, sonho' },
      ],
      580,
      6,
    ),
    fileiraCaixas(
      [
        { simbolos: 'rr', rotulo: 'carro, cachorro' },
        { simbolos: 'ss', rotulo: 'pássaro, osso' },
        { simbolos: 'qu', rotulo: 'queijo, quintal' },
      ],
      780,
      9,
    ),
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 990">
  <rect id="regiao-fundo" class="colorir-alvo" x="0" y="0" width="800" height="990" fill="#ffffff"/>
  ${corpo}
</svg>`;
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
  posters: { vogaisSvg: string; tituloVogais: string },
): LivroGerado {
  const arquivos: Record<string, string> = {};
  const linhasAssets: string[] = [];
  const corpo: string[] = [`# ${titulo}`, '', intro, ''];

  // pôster da tabela completa — todas as letras num arquivo só, pintável;
  // o botão de imprimir já deriva o contorno P&B (vira folha de colorir A4)
  arquivos[`${id}_tabela.svg`] = svgTabelaAlfabeto(titulo, letras);
  linhasAssets.push(
    '  - id: "tabela"',
    '    tipo: "colorir"',
    `    arquivo_interativo: "${id}_tabela.svg"`,
  );
  corpo.push('## A tabela inteira para pintar', '', '{{img:tabela}}', '');

  // vogais logo abaixo da tabela completa (pedido do Bruno na rodada 5)
  arquivos[`${id}_vogais.svg`] = posters.vogaisSvg;
  linhasAssets.push(
    '  - id: "vogais"',
    '    tipo: "colorir"',
    `    arquivo_interativo: "${id}_vogais.svg"`,
  );
  corpo.push(`## ${posters.tituloVogais}`, '', '{{img:vogais}}', '');

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
      { vogaisSvg: svgVogaisGrego(), tituloVogais: 'Vogais e ditongos para pintar' },
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
      { vogaisSvg: svgVogaisLatino(), tituloVogais: 'Vogais e encontros para pintar' },
    ),
  ];
}
