// O livro "Os Números", GERADO por código — mesmo molde dos alfabetos
// (alfabetos.ts): cada folha vira um asset de colorir e uma seção do livro,
// e tudo passa pelo pipeline comum (carregarLivro + registro de assets).
// O parser continua sem saber que número existe.
//
// IDs publicados (livro `numeros`, assets e regiões) não se renomeiam.
//
// A leitura fala com a criança de 7 a 9 anos, em casa. O que é orientação
// para a professora fica na própria folha e no guia.

import { carregarLivro } from '../motor/frontmatter';
import type { Livro } from '../motor/tipos';
import type { FichaAlfabeto } from './alfabetos';
import {
  NOMES_DOS_NUMEROS,
  svgDezenasA4,
  svgJuntarA4,
  svgNumeroA4,
  svgNumerosTabelaA4,
  svgRelogioRomanoA4,
  svgRepartirA4,
  svgRomanosA4,
  svgTabuadaA4,
  svgTirarA4,
  svgVezesA4,
} from './numeroArte';

export const ID_LIVRO_NUMEROS = 'numeros';

// o que a criança lê (e ouve) em cada número
const CONVITES: string[] = [
  'Zero é o número de quando não tem nada. Nenhuma estrela, nenhum biscoito! Parece um ovo. O que será que vai nascer dele?',
  'Um é só um: um nariz, um sol, um você! Fininho feito um palito. Levante um dedo e diga: um!',
  'Dois: dois olhos, duas mãos, dois pés. O dois parece um cisne passeando no lago. Quem anda de dois em dois na sua casa?',
  'Três: três porquinhos, três pulinhos. Um, dois, três e já! O três tem duas barriguinhas.',
  'Quatro: quatro patas tem o cachorro, quatro rodas tem o carro. O quatro parece uma cadeira de cabeça para baixo.',
  'Cinco: os dedos de uma mão inteira! Bate aqui: cinco! O cinco usa um chapéu reto.',
  'Seis: uma mão inteira e mais um dedo. O seis tem uma barrigona embaixo. Ele comeu demais?',
  'Sete: os dias da semana são sete. O sete parece um nariz comprido. Hoje é qual dia?',
  'Oito: oito pernas tem a aranha! O oito é feito de duas bolinhas, uma em cima da outra. Um boneco de neve!',
  'Nove: quase dez! Falta só um. O nove é um seis que resolveu plantar bananeira.',
  'Dez: todos os dedos das duas mãos! Um e zero de mãos dadas. Mostre as duas mãos e conte bem alto.',
];

const CONVITES_DAS_OUTRAS: Record<string, string> = {
  tabela: 'Aqui moram todos os números de zero a dez. Qual é o seu preferido? Escolha uma cor para cada um e conte em voz alta enquanto pinta.',
  dezenas: 'De dez em dez a gente chega longe! Dez, vinte, trinta… É como subir uma escada pulando degraus. Até onde você consegue ir?',
  romanos: 'Os romanos antigos escreviam números com letras. I é um, V é cinco, X é dez. Olhe a sua mão aberta: o V parece a mão com o polegar afastado!',
  relogio: 'Tic, tac! Muitos relógios antigos usam números romanos. Pinte cada hora e desenhe os ponteiros na hora de que você mais gosta.',
  juntar: 'Juntar é a conta de mais. Duas bolinhas chegam, três bolinhas chegam também… quantas ficaram brincando juntas? Conte todas!',
  tirar: 'Tirar é a conta de menos. Algumas bolinhas vão embora para casa. Risque as que foram e conte as que ficaram.',
  vezes: 'Vezes é juntar grupos iguais. Dois saquinhos com três balas cada um: quantas balas? Conte grupo por grupo.',
  repartir: 'Repartir é dividir igual, para ninguém ficar triste. Uma para você, uma para mim, uma para você, uma para mim… até acabar!',
  tabuada: 'A tabuada é um tabuleiro cheio de segredos. Escolha um número e pinte a fileira dele. Tem número que aparece em mais de um lugar. Você acha?',
};

export function gerarCadernoNumeros(): FichaAlfabeto[] {
  const fichas: FichaAlfabeto[] = [];
  const add = (id: string, titulo: string, svg: string, grupo: string) =>
    fichas.push({ id, arquivo: `${ID_LIVRO_NUMEROS}_${id}.svg`, titulo, svg, grupo });

  add('tabela', 'Os números de zero a dez', svgNumerosTabelaA4(), 'Todos em uma folha');
  for (let n = 0; n <= 10; n++) {
    add(`numero${String(n).padStart(2, '0')}`, `${n} · ${NOMES_DOS_NUMEROS[n]}`, svgNumeroA4(n), 'Números');
  }
  add('dezenas', 'De dez em dez até cem', svgDezenasA4(), 'Consulta');
  add('romanos', 'Números romanos', svgRomanosA4(), 'Romanos');
  add('relogio', 'O relógio romano', svgRelogioRomanoA4(), 'Romanos');
  add('juntar', 'Juntar: a conta de mais', svgJuntarA4(), 'Operações');
  add('tirar', 'Tirar: a conta de menos', svgTirarA4(), 'Operações');
  add('vezes', 'Grupos iguais: a conta de vezes', svgVezesA4(), 'Operações');
  add('repartir', 'Repartir igual: a conta de dividir', svgRepartirA4(), 'Operações');
  add('tabuada', 'Tabuada para pintar', svgTabuadaA4(), 'Operações');
  return fichas;
}

export function gerarNumeros(): { livro: Livro; arquivos: Record<string, string> } {
  const fichas = gerarCadernoNumeros();
  const arquivos = Object.fromEntries(fichas.map((f) => [f.arquivo, f.svg]));
  const linhas = [
    '---',
    'titulo: "Os Números"',
    'faixa_etaria: "5-9"',
    'nivel_leitura: "iniciante"',
    'licenca: "CC0"',
    'tema_padrao: "arco-iris"',
    'assets:',
  ];
  for (const f of fichas) {
    linhas.push(`  - id: "${f.id}"`, '    tipo: "colorir"', `    arquivo_interativo: "${f.arquivo}"`);
  }
  linhas.push(
    'quiz:',
    '  - pergunta: "Quantos dedos você tem nas duas mãos juntas?"',
    '    alternativas: ["Dez", "Cinco", "Vinte"]',
    '    correta: 0',
    '    nivel: "capitulo"',
    '    explicacao: "São dez: cinco em cada mão. Por isso a gente conta de dez em dez!"',
    '---',
    '',
    '# Os Números',
    '',
    'Os números moram em todo lugar: nos dedos, nos degraus, no relógio, na sua idade! Aqui tem número para pintar, para contar e para brincar de juntar e repartir. Comece por onde quiser.',
    '',
  );
  for (const f of fichas) {
    linhas.push(`## ${f.titulo}`, '');
    const convite = f.grupo === 'Números' ? CONVITES[Number(f.id.slice(6))] : CONVITES_DAS_OUTRAS[f.id];
    if (convite) linhas.push(convite, '');
    linhas.push(`{{img:${f.id}}}`, '');
  }
  return { livro: carregarLivro(ID_LIVRO_NUMEROS, linhas.join('\n')), arquivos };
}
