// Conteúdo autoral; fontes de conferência em docs/ALFABETOS_A4.md.
export interface Complemento {
  id: string;
  titulo: string;
  simbolos: string;
  categoria: string;
  explicacao: string;
  exemplo: string;
  atividade: string;
}

export const DITONGOS_GREGOS: Complemento[] = [
  ['ai', 'αι', 'alfa + iota'], ['ei', 'ει', 'épsilon + iota'],
  ['oi', 'οι', 'ômicron + iota'], ['au', 'αυ', 'alfa + úpsilon'],
  ['eu', 'ευ', 'épsilon + úpsilon'], ['ou', 'ου', 'ômicron + úpsilon'],
  ['hu', 'ηυ', 'eta + úpsilon'], ['ui', 'υι', 'úpsilon + iota'],
].map(([id, simbolos, composicao]) => ({
  id: `ditongo-${id}`, titulo: `Ditongo ${simbolos}`, simbolos, categoria: 'Grego antigo · ditongos',
  explicacao: `Observe as duas letras: ${composicao}.`,
  exemplo: id === 'ei' || id === 'ou'
    ? 'Na leitura ática adotada, esta grafia representa uma vogal longa.'
    : 'Conheça a combinação com a leitura feita pela professora.',
  atividade: 'Pinte cada letra. Depois contorne ou copie a combinação.',
}));

export const DIGRAFOS: Complemento[] = [
  ['ch', 'chave, chuva'], ['lh', 'ilha, palhaço'], ['nh', 'ninho, sonho'],
  ['rr', 'carro, cachorro'], ['ss', 'osso, pássaro'],
  ['qu', 'queijo, quintal'], ['gu', 'guerra, guitarra'],
].map(([simbolos, exemplo]) => ({
  id: `digrafo-${simbolos}`, titulo: `Dígrafo ${simbolos.toUpperCase()}`, simbolos,
  categoria: 'Português · dígrafos',
  explicacao: 'Nestas palavras, duas letras representam um som.',
  exemplo,
  atividade: simbolos === 'qu' || simbolos === 'gu'
    ? 'Nos exemplos, o U não é pronunciado. Observe com a professora.'
    : 'Diga uma palavra, aponte as letras ou faça um desenho.',
}));

export const DITONGOS_PORTUGUES: Complemento[] = [
  ['ai', 'pai'], ['ei', 'rei'], ['oi', 'boi'], ['au', 'pau'],
  ['eu', 'meu'], ['ou', 'sou'], ['ao', 'ão', 'pão'], ['oe', 'õe', 'põe'],
].map(([id, segundo, terceiro]) => ({
  id: `ditongo-${id}`, simbolos: terceiro ? segundo : id,
  titulo: `Ditongo ${(terceiro ? segundo : id).toUpperCase()}`,
  categoria: 'Português · ditongos',
  explicacao: 'Vogal e semivogal ficam na mesma sílaba.',
  exemplo: terceiro || segundo,
  atividade: id === 'ou'
    ? 'Ouça SOU: em muitas falas do Brasil, OU soa como um O.'
    : 'Ouça a palavra. Pinte a combinação e experimente escrevê-la.',
}));

export const EXTRAS_GREGOS: Complemento[] = [
  { id: 'sigma-final', titulo: 'Sigma: duas formas minúsculas', simbolos: 'σς', categoria: 'Grego antigo · formas da letra', explicacao: 'Use σ no início ou no meio da palavra.', exemplo: 'Use ς no final da palavra. As duas formas são sigma.', atividade: 'Compare os contornos. Contorne ou escreva cada forma.' },
  ...[['alfa','ᾳ','alfa longa'],['eta','ῃ','eta'],['omega','ῳ','ômega']].map(([id,simbolos,nome]) => ({ id:`iota-subscrito-${id}`,titulo:`Iota subscrito: ${simbolos}`,simbolos,categoria:'Grego antigo · ampliação',explicacao:`A pequena marca sob ${nome} é um iota.`,exemplo:'Convenção editorial: a marca registra um antigo encontro de vogais.',atividade:'Localize a pequena marca antes de pintar ou copiar.' })),
  { id:'sinais', titulo:'Sinais do grego antigo', simbolos:'ἀἁ',categoria:'Grego antigo · ampliação',explicacao:'Espírito suave: sem aspiração. Espírito áspero: com aspiração.',exemplo:'Compare ἀ e ἁ. Acentos e espíritos não são letras novas.',atividade:'Observe a posição dos sinais com a professora.' },
];

export const EXTRAS_PORTUGUES: Complemento[] = [
  { id:'cedilha',titulo:'C com cedilha',simbolos:'Çç',categoria:'Português · sinais da escrita',explicacao:'O Ç não é uma letra extra do alfabeto.',exemplo:'laço, maçã, açúcar',atividade:'Encontre a cedilha. Ela muda o som do C antes de A, O e U.' },
  { id:'hiato',titulo:'Vogais em sílabas diferentes',simbolos:'aí',categoria:'Português · hiato',explicacao:'No hiato, as vogais ficam em sílabas diferentes.',exemplo:'sa-í-da · sa-ú-de · po-e-ta',atividade:'Ouça a separação das sílabas. Fale, aponte ou desenhe.' },
];

export const CONVENCAO_GREGO = 'Grego antigo: leitura didática de base ática clássica. As aproximações em português não reproduzem todos os sons antigos. Nesta convenção, θ, φ e χ são t, p e k aspirados; η e ω são vogais longas, υ é arredondado; ει e ου podem representar vogais longas. A professora apresenta os modelos, sem cobrar imitação perfeita.';
