// Livros de alfabeto (grego e latino) GERADOS por código: uma página de
// colorir por letra e fichas complementares, a partir dos mesmos dados.
// Idealizado pelo Davi (9): "bastante coisa para pintar e aprender grego".
//
// Importante: a geração produz markdown + assets normais e passa pelo MESMO
// pipeline (carregarLivro + registro de assets). O parser continua burro;
// nenhuma regra nova foi criada.

import { carregarLivro } from '../motor/frontmatter';
import type { Livro } from '../motor/tipos';
import { svgLetraA4, svgTabelaA4, svgQuadrosA4, svgComplementoA4 } from './alfabetoArte';
import { DIGRAFOS, DITONGOS_GREGOS, DITONGOS_PORTUGUES, EXTRAS_GREGOS, EXTRAS_PORTUGUES } from './alfabetoComplementos';
import { DICAS_GREGO, BRINCADEIRAS_PORTUGUES } from './alfabetoBrincadeiras';

// [maiúscula, minúscula, nome, dica de som, nome secundário p/ tabela impressa]
// No grego, o 5º campo é o nome da letra escrito EM GREGO (Αλφα, Βητα...).
export type DadoLetra = [string, string, string, string, string?];

export const GREGO: DadoLetra[] = [
  ['Α', 'α', 'Alfa', 'faz o som de "a", como em amigo', 'Αλφα'],
  ['Β', 'β', 'Beta', 'faz o som de "b", como em bola', 'Βητα'],
  ['Γ', 'γ', 'Gama', 'faz o som de "g", como em gato', 'Γαμμα'],
  ['Δ', 'δ', 'Delta', 'faz o som de "d", como em dado', 'Δελτα'],
  ['Ε', 'ε', 'Épsilon', 'faz o som de "é" bem curtinho', 'Εψιλον'],
  ['Ζ', 'ζ', 'Zeta', 'é lido aqui como a sequência "zd"; outras tradições usam "dz"', 'Ζητα'],
  ['Η', 'η', 'Eta', 'representa um "é" longo nesta leitura', 'Ητα'],
  ['Θ', 'θ', 'Teta', 'é lido como "t" seguido de uma pequena saída de ar', 'Θητα'],
  ['Ι', 'ι', 'Iota', 'faz o som de "i", como em ilha', 'Ιωτα'],
  ['Κ', 'κ', 'Capa', 'faz o som de "k", como em kiwi', 'Καππα'],
  ['Λ', 'λ', 'Lambda', 'faz o som de "l", como em leão', 'Λαμβδα'],
  ['Μ', 'μ', 'Mi', 'faz o som de "m", como em macaco', 'Μυ'],
  ['Ν', 'ν', 'Ni', 'faz o som de "n", como em navio', 'Νυ'],
  ['Ξ', 'ξ', 'Csi', 'faz a sequência "ks", como em táxi', 'Ξι'],
  ['Ο', 'ο', 'Ômicron', 'faz o som de "ó" bem curtinho', 'Ομικρον'],
  ['Π', 'π', 'Pi', 'faz o som de "p" — é o famoso número π da matemática!', 'Πι'],
  ['Ρ', 'ρ', 'Rô', 'é lido com a ponta da língua vibrando; escute o modelo da professora', 'Ρω'],
  ['Σ', 'σ', 'Sigma', 'faz o som de "s", como em sapo. No fim da palavra ele se veste diferente: ς', 'Σιγμα'],
  ['Τ', 'τ', 'Tau', 'faz o som de "t", como em tatu', 'Ταυ'],
  ['Υ', 'υ', 'Úpsilon', 'é lido como um "i" com os lábios arredondados', 'Υψιλον'],
  ['Φ', 'φ', 'Fi', 'é lido como "p" seguido de uma pequena saída de ar', 'Φι'],
  ['Χ', 'χ', 'Qui', 'é lido como "k" seguido de uma pequena saída de ar', 'Χι'],
  ['Ψ', 'ψ', 'Psi', 'faz o som de "ps", como em psiu!', 'Ψι'],
  ['Ω', 'ω', 'Ômega', 'representa um "ó" longo nesta leitura e é a última letra do alfabeto', 'Ωμεγα'],
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

// IDs de livros, assets e regiões publicados são preservados.
export interface FichaAlfabeto { id: string; arquivo: string; titulo: string; svg: string; grupo: string; }

export function gerarCadernoAlfabeto(id: string): FichaAlfabeto[] {
  if (id !== 'alfabeto' && id !== 'alfabeto-grego') return [];
  const grego = id === 'alfabeto-grego', dados = grego ? GREGO : LATINO;
  const titulo = grego ? 'O Alfabeto Grego' : 'O Alfabeto';
  const fichas: FichaAlfabeto[] = [];
  const add = (assetId: string, nome: string, svg: string, grupo: string) => fichas.push({id:assetId,arquivo:`${id}_${assetId}.svg`,titulo:nome,svg,grupo});
  add('tabela', titulo, svgTabelaA4(titulo,dados,grego), 'Alfabeto completo');
  const grupos = grego ? [
    { titulo:'Vogais: observe a duração', itens:[
      {simbolos:'ε',rotulo:'breve',id:1},{simbolos:'ο',rotulo:'breve',id:2},
      {simbolos:'η',rotulo:'longa',id:3},{simbolos:'ω',rotulo:'longa',id:4},
      {simbolos:'α',rotulo:'breve ou longa',id:5},{simbolos:'ι',rotulo:'breve ou longa',id:6},{simbolos:'υ',rotulo:'breve ou longa',id:7},
    ]},
    { titulo:'Combinações estudadas como ditongos',itens:DITONGOS_GREGOS.map((c,i)=>({simbolos:c.simbolos,rotulo:[...c.simbolos].join(' + '),id:i+8}))},
  ] : [
    { titulo:'As cinco letras vogais',itens:LATINO.filter(l=>'AEIOU'.includes(l[0])).map((l,i)=>({simbolos:l[0]+l[1],rotulo:l[3].slice(3),id:i+1}))},
    { titulo:'Dígrafos: duas letras para um som',itens:DIGRAFOS.map((c,i)=>({simbolos:c.simbolos,rotulo:c.exemplo.split(',')[0],id:i+6}))},
  ];
  add('vogais', grego?'Vogais e ditongos gregos':'Vogais e dígrafos', svgQuadrosA4(grego?'Vogais e ditongos gregos':'Vogais e dígrafos',grego?'Grego antigo · consulta':'Português · consulta',grupos,
    grego?'Leitura de base ática: ει e ου podem representar vogais longas. A duração é diferente da intensidade da voz.':'Nos exemplos QUEIJO e GUERRA, o U não é pronunciado. Dígrafos e ditongos são grupos diferentes.'),'Consulta');
  dados.forEach((l,i)=>add(`letra${String(i+1).padStart(2,'0')}`,grego?l[2]:`${l[0]} ${l[3]}`,svgLetraA4(l,i,dados,grego),'Letras'));
  if(!grego) add('ditongos','Ditongos do português',svgQuadrosA4('Ditongos do português','Português · consulta',[
    {titulo:'Vogal e semivogal na mesma sílaba',itens:DITONGOS_PORTUGUES.map(c=>({simbolos:c.simbolos,rotulo:c.exemplo}))}
  ],'São exemplos para começar. A fala varia: OU pode soar como O. Ouça as palavras com a professora.'),'Consulta');
  const complementos = grego ? [...DITONGOS_GREGOS,...EXTRAS_GREGOS] : [...DIGRAFOS,...DITONGOS_PORTUGUES,...EXTRAS_PORTUGUES];
  complementos.forEach(c=>add(c.id,c.titulo,svgComplementoA4(c),c.categoria));
  return fichas;
}

interface LivroGerado { livro: Livro; arquivos: Record<string,string>; }
function gerarLivro(id: string): LivroGerado {
  const grego=id==='alfabeto-grego',titulo=grego?'O Alfabeto Grego':'O Alfabeto';
  const fichas=gerarCadernoAlfabeto(id), arquivos=Object.fromEntries(fichas.map(f=>[f.arquivo,f.svg]));
  const linhas=['---',`titulo: "${titulo}"`,`faixa_etaria: "${grego?'8-12':'5-8'}"`,'nivel_leitura: "iniciante"','licenca: "CC0"',`tema_padrao: "${grego?'espaco':'arco-iris'}"`,'assets:'];
  for(const f of fichas) linhas.push(`  - id: "${f.id}"`,'    tipo: "colorir"',`    arquivo_interativo: "${f.arquivo}"`);
  linhas.push('quiz:',`  - pergunta: "${grego?'Qual é a ÚLTIMA letra do alfabeto grego?':'Quantas letras tem o nosso alfabeto?'}"`,
    `    alternativas: ${grego?'["Alfa", "Ômega", "Beta"]':'["26", "20", "30"]'}`,
    `    correta: ${grego?1:0}`,'    nivel: "capitulo"',
    `    explicacao: "${grego?'Ômega é a última letra. Do alfa ao ômega, do começo ao fim!':'São 26 letras, de A até Z!'}"`,'---','',`# ${titulo}`,'',
    grego?'Vamos passear por 24 letras do grego antigo! Algumas parecem nossas conhecidas; outras vieram de roupa diferente. Escolha uma, brinque com o som e invente suas cores. Do alfa ao ômega, a aventura é sua!':'Temos 26 letras e um montão de histórias para inventar! Tem abelha, gato, navio e até um ovo misterioso. Escolha uma letra para pintar, dizer em voz alta ou transformar num desenho.','');
  const dados = grego ? GREGO : LATINO;
  const complementos = grego ? [...DITONGOS_GREGOS,...EXTRAS_GREGOS] : [...DIGRAFOS,...DITONGOS_PORTUGUES,...EXTRAS_PORTUGUES];
  fichas.forEach(f=>{
    linhas.push(`## ${f.titulo}`,'');
    // O texto continua disponível para a leitura em voz alta do app.
    if (f.grupo === 'Letras') {
      const l = dados[Number(f.id.slice(5))-1];
      linhas.push(grego ? DICAS_GREGO[l[0]] : `${l[2]} ${l[3]}. ${BRINCADEIRAS_PORTUGUES[l[0]]}`,'');
    } else {
      const c = complementos.find(c=>c.id===f.id);
      if(c) {
        const convite = grego && f.id.startsWith('ditongo-')
          ? `${c.explicacao} Duas letras saíram juntas para passear! ${f.id==='ditongo-ei'?'Aqui, ει faz um e fechado comprido: eeee!':f.id==='ditongo-ou'?'Aqui, ου faz um u comprido: uuuu!':'Que tal encontrar cada uma na tabela?'} Escolha uma cor para cada letra.`
          : `${c.explicacao} ${c.exemplo} Que tal pintar, contornar ou inventar um desenho para lembrar?`;
        linhas.push(convite,'');
      }
    }
    linhas.push(`{{img:${f.id}}}`,'');
  });
  return {livro:carregarLivro(id,linhas.join('\n')),arquivos};
}
export function gerarAlfabetos(): LivroGerado[] { return [gerarLivro('alfabeto-grego'),gerarLivro('alfabeto')]; }
