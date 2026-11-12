// As pastas da estante. Antes a estante despejava todos os livros numa grade
// só (31 cartões); agora cada livro mora numa pasta, e a criança vê uma pasta
// de cada vez.
//
// Os ids dos LIVROS não mudam (LEI 6). Os ids das PASTAS ficam guardados na
// preferência "última pasta" de cada perfil: também não se renomeiam — o
// rótulo e o emoji podem mudar à vontade.
//
// Para pôr um livro novo numa pasta: acrescentar o id em `livros` da pasta.
// Livro sem pasta não some: cai na pasta `PASTA_DOS_SEM_PASTA`, e o teste
// (pastas.test.ts) avisa.

import { livrosBosquesCastelos } from './colecaoBosquesCastelos';
import { livrosPrimeirasAventuras } from './colecaoPrimeirasAventuras';

export interface Pasta {
  id: string;
  rotulo: string;
  emoji: string;
  /** ids dos livros que moram AQUI (não inclui os das pastas de dentro) */
  livros: string[];
  filhas: Pasta[];
}

export const PASTAS: Pasta[] = [
  {
    id: 'historias',
    rotulo: 'Histórias',
    emoji: '📚',
    livros: [],
    filhas: [
      {
        id: 'primeiras-aventuras',
        rotulo: 'Primeiras Aventuras',
        emoji: '🐜',
        livros: livrosPrimeirasAventuras.map((l) => l.id),
        filhas: [],
      },
      {
        id: 'bosques-castelos',
        rotulo: 'Entre Bosques e Castelos',
        emoji: '🏰',
        livros: livrosBosquesCastelos.map((l) => l.id),
        filhas: [],
      },
      {
        id: 'classicos',
        rotulo: 'Clássicos',
        emoji: '🌹',
        livros: [
          'o-pequeno-principe',
          'lebre-e-tartaruga',
          'o-leao-e-o-ratinho',
          'a-raposa-e-as-uvas',
          'o-vento-e-o-sol',
        ],
        filhas: [],
      },
      {
        id: 'para-pensar',
        rotulo: 'Para pensar',
        emoji: '💭',
        livros: ['o-que-depende-de-mim', 'socrates-e-as-duas-cestas', 'o-sonho-do-menino-rene'],
        filhas: [],
      },
    ],
  },
  {
    id: 'alfabetos',
    rotulo: 'Alfabetos',
    emoji: '🔤',
    livros: ['alfabeto', 'alfabeto-grego'],
    filhas: [],
  },
];

export const PASTA_PADRAO = 'historias';
export const PASTA_DOS_SEM_PASTA = 'classicos';

/** Todas as pastas, das de fora para as de dentro, na ordem em que aparecem. */
export function todasAsPastas(pastas: Pasta[] = PASTAS): Pasta[] {
  return pastas.flatMap((p) => [p, ...todasAsPastas(p.filhas)]);
}

export function acharPasta(id: string): Pasta | undefined {
  return todasAsPastas().find((p) => p.id === id);
}

/** A pasta em que um livro mora (a dos sem-pasta, se ninguém o reclamou). */
export function pastaDoLivro(idLivro: string): Pasta {
  return (
    todasAsPastas().find((p) => p.livros.includes(idLivro)) ?? acharPasta(PASTA_DOS_SEM_PASTA)!
  );
}

/** Quantos livros há numa pasta, contando os das pastas de dentro. */
export function contarLivros(pasta: Pasta, idsExistentes: string[]): number {
  return secoesDaPasta(pasta, idsExistentes).reduce((n, s) => n + s.livros.length, 0);
}

/**
 * O que a estante mostra ao abrir uma pasta: uma seção por pasta que tenha
 * livros (ela mesma e as de dentro), só com livros que existem no catálogo e
 * na ordem do catálogo. Os livros sem pasta entram na pasta dos sem-pasta.
 */
export function secoesDaPasta(
  pasta: Pasta,
  idsExistentes: string[],
): Array<{ pasta: Pasta; livros: string[] }> {
  return [pasta, ...todasAsPastas(pasta.filhas)]
    .map((p) => ({
      pasta: p,
      livros: idsExistentes.filter((id) => pastaDoLivro(id).id === p.id),
    }))
    .filter((s) => s.livros.length > 0);
}
