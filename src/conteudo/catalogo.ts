// Catálogo de livros e registro de assets — tudo empacotado no bundle
// via import ?raw (zero rede em runtime, princípio 2 da spec).
// Para adicionar um livro novo: criar o .md em livros/, os SVGs em assets/,
// e registrar os dois aqui. Nada mais.

import { carregarLivro } from '../motor/frontmatter';
import type { Livro } from '../motor/tipos';

import lebreMd from './livros/lebre-e-tartaruga.md?raw';
import lebreColorirSvg from './assets/lebre_colorir.svg?raw';

export const livros: Livro[] = [
  carregarLivro('lebre-e-tartaruga', lebreMd),
];

// arquivo declarado no front matter → conteúdo SVG
export const arquivosAssets: Record<string, string> = {
  'lebre_colorir.svg': lebreColorirSvg,
};

export function obterLivro(id: string): Livro | undefined {
  return livros.find((l) => l.id === id);
}
